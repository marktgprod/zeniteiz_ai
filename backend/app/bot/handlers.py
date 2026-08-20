from aiogram import Bot, F, Router
from aiogram.filters import Command, CommandObject
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, Message, WebAppInfo

from app.bot.i18n import t
from app.config import settings
from app.db import async_session
from app.services.referral import MILESTONES, count_qualified_referrals, parse_referrer_telegram_id, referral_link
from app.services.user import get_or_create_user, get_user_by_telegram_id

router = Router()

# Single source of truth for the Telegram command menu — registered via
# bot.set_my_commands() (see /api/cron/set-commands), not automatic, so a
# newly added command here still needs that endpoint hit once after deploy.
BOT_COMMANDS: list[tuple[str, str]] = [
    ("start", "Начать / открыть меню"),
    ("app", "Открыть приложение"),
    ("stats", "Моя статистика и подписка"),
    ("invite", "Пригласить друзей и получить подарок"),
    ("support", "Написать в поддержку"),
    ("help", "Список всех команд"),
]


def _webapp_keyboard(lang: str | None) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text=t(lang, "webapp_button"), web_app=WebAppInfo(url=settings.mini_app_url))]
        ]
    )


@router.message(Command("start"))
async def cmd_start(message: Message, command: CommandObject) -> None:
    referrer_telegram_id = parse_referrer_telegram_id(command.args)

    async with async_session() as db:
        user, is_new = await get_or_create_user(
            db,
            message.from_user.id,
            message.from_user.username,
            message.from_user.first_name,
            referrer_telegram_id=referrer_telegram_id,
        )

    lang = user.language
    if message.from_user.first_name:
        name = message.from_user.first_name
    elif message.from_user.username:
        name = f"@{message.from_user.username}"
    else:
        name = t(lang, "friend_fallback")
    features = t(lang, "features")
    support = t(lang, "support_contact")

    key = "welcome_new" if is_new else "welcome_back"
    text = t(lang, key, name=name, features=features, support=support)

    await message.answer(text, reply_markup=_webapp_keyboard(lang))


@router.message(Command("app"))
async def cmd_app(message: Message) -> None:
    async with async_session() as db:
        user = await get_user_by_telegram_id(db, message.from_user.id)
    lang = user.language if user else None
    await message.answer(t(lang, "open_app_prompt"), reply_markup=_webapp_keyboard(lang))


@router.message(Command("help"))
async def cmd_help(message: Message) -> None:
    async with async_session() as db:
        user = await get_user_by_telegram_id(db, message.from_user.id)
    await message.answer(t(user.language if user else None, "help"))


@router.message(Command("stats"))
async def cmd_stats(message: Message) -> None:
    async with async_session() as db:
        user = await get_user_by_telegram_id(db, message.from_user.id)

    if user is None:
        await message.answer(t(None, "not_registered"))
        return

    expires = user.subscription_expires_at.strftime("%d.%m.%Y") if user.subscription_expires_at else "—"
    text = t(
        user.language,
        "stats",
        tier=user.subscription_tier.value,
        expires=expires,
        today=user.requests_today,
        month=user.requests_month,
    )
    await message.answer(text)


@router.message(Command("invite"))
async def cmd_invite(message: Message) -> None:
    async with async_session() as db:
        user = await get_user_by_telegram_id(db, message.from_user.id)

        if user is None:
            await message.answer(t(None, "not_registered"))
            return

        qualified = await count_qualified_referrals(db, user.id)

    lang = user.language
    link = referral_link(user.telegram_user_id)
    next_milestone = next((m for m in MILESTONES if m.referrals_required > qualified), None)
    progress = (
        t(lang, "invite_progress_next", label=next_milestone.label[lang], qualified=qualified, required=next_milestone.referrals_required)
        if next_milestone
        else t(lang, "invite_progress_done", qualified=qualified)
    )

    milestone_lines = "\n".join(
        t(lang, "invite_milestone_line", count=m.referrals_required, label=m.label[lang]) for m in MILESTONES
    )

    text = (
        f"{t(lang, 'invite_intro')}\n\n"
        f"{milestone_lines}\n\n"
        f"{progress}\n\n"
        f"{t(lang, 'invite_link_label')}\n<code>{link}</code>"
    )
    await message.answer(text)


@router.message(Command("support"))
async def cmd_support(message: Message, command: CommandObject, bot: Bot) -> None:
    async with async_session() as db:
        user = await get_user_by_telegram_id(db, message.from_user.id)
    lang = user.language if user else None

    if not command.args:
        await message.answer(t(lang, "support_usage"))
        return

    if not settings.telegram_admin_chat_id:
        await message.answer(t(lang, "support_thanks_pending"))
        return

    from_user = message.from_user
    await bot.send_message(
        settings.telegram_admin_chat_id,
        f"📩 Обращение от @{from_user.username or from_user.id} (id={from_user.id}):\n\n{command.args}",
    )
    await message.answer(t(lang, "support_thanks_sent"))


@router.message(F.text)
async def fallback(message: Message) -> None:
    async with async_session() as db:
        user = await get_user_by_telegram_id(db, message.from_user.id)
    await message.answer(t(user.language if user else None, "fallback"))
