import json
import logging
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

import aiohttp
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.news import NewsItem
from app.services.openrouter import MODEL_SLUGS, OpenRouterError, chat_completion

logger = logging.getLogger(__name__)

# Real RSS feeds only — an LLM is used solely to translate/summarize what these
# publishers actually reported, never to invent "news" from its own knowledge.
FEEDS = [
    "https://techcrunch.com/category/artificial-intelligence/feed/",
    "https://venturebeat.com/category/ai/feed/",
    "https://www.artificialintelligence-news.com/feed/",
]

ITEMS_PER_FEED = 4
MAX_NEW_ITEMS_PER_RUN = 6


def _parse_rss(xml_text: str) -> list[dict]:
    root = ET.fromstring(xml_text)
    items = []
    for item in root.findall("./channel/item")[:ITEMS_PER_FEED]:
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        description = (item.findtext("description") or "").strip()

        published_at = None
        pub_date_raw = item.findtext("pubDate")
        if pub_date_raw:
            try:
                published_at = parsedate_to_datetime(pub_date_raw)
                if published_at.tzinfo is None:
                    published_at = published_at.replace(tzinfo=timezone.utc)
            except (TypeError, ValueError):
                published_at = None

        if title and link:
            items.append({"title": title, "link": link, "description": description, "published_at": published_at})
    return items


async def _fetch_feed(session: aiohttp.ClientSession, url: str) -> list[dict]:
    try:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=15)) as resp:
            if resp.status != 200:
                return []
            text = await resp.text()
            return _parse_rss(text)
    except (aiohttp.ClientError, ET.ParseError):
        logger.warning("Failed to fetch/parse news feed %s", url, exc_info=True)
        return []


async def _translate_article(title: str, description: str) -> tuple[str, str]:
    prompt = (
        'Переведи и кратко перескажи новость об ИИ на русском для дайджеста в приложении. '
        'Ответь строго в формате JSON: {"title": "...", "summary": "..."}. '
        "title — короткий переведённый заголовок. summary — 2-3 предложения по-русски.\n\n"
        f"Заголовок: {title}\nОписание: {description}"
    )
    data = await chat_completion(
        MODEL_SLUGS["gpt4o"],
        [{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=300,
        response_format={"type": "json_object"},
    )
    parsed = json.loads(data["choices"][0]["message"]["content"])
    return parsed["title"], parsed["summary"]


async def fetch_and_store_news(db: AsyncSession) -> int:
    async with aiohttp.ClientSession() as session:
        all_items: list[dict] = []
        for feed_url in FEEDS:
            all_items.extend(await _fetch_feed(session, feed_url))

    if not all_items:
        return 0

    all_items.sort(key=lambda i: i["published_at"] or datetime.min.replace(tzinfo=timezone.utc), reverse=True)

    existing_urls = set(
        (await db.execute(select(NewsItem.source_url).where(NewsItem.source_url.is_not(None)))).scalars().all()
    )

    added = 0
    for item in all_items:
        if added >= MAX_NEW_ITEMS_PER_RUN:
            break
        if item["link"] in existing_urls:
            continue

        try:
            title_ru, summary_ru = await _translate_article(item["title"], item["description"])
        except (OpenRouterError, KeyError, json.JSONDecodeError):
            logger.warning("Failed to translate news item %s", item["link"], exc_info=True)
            continue

        db.add(
            NewsItem(
                title=title_ru,
                summary=summary_ru,
                content=summary_ru,
                source_url=item["link"],
                published_at=item["published_at"] or datetime.now(timezone.utc),
            )
        )
        existing_urls.add(item["link"])
        added += 1

    if added:
        await db.commit()
    return added
