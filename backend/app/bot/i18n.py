from typing import Any

# Bot-only UI strings. Loyalty level names / reward text and referral
# milestone labels live next to their own data (app/services/loyalty.py,
# app/services/referral.py) since the mini app's API also needs them
# localized, not just the bot.
_MESSAGES: dict[str, dict[str, str]] = {
    "features": {
        "ru": (
            "💬 <b>Текст</b> — Claude Sonnet 5, GPT-4o mini\n"
            "🎨 <b>Фото</b> — Flux.1 Pro\n"
            "🎬 <b>Видео</b> — MiniMax Video-01\n"
            "✨ <b>Промпты</b> — библиотека готовых запросов"
        ),
        "en": (
            "💬 <b>Text</b> — Claude Sonnet 5, GPT-4o mini\n"
            "🎨 <b>Photos</b> — Flux.1 Pro\n"
            "🎬 <b>Video</b> — MiniMax Video-01\n"
            "✨ <b>Prompts</b> — a library of ready-to-use prompts"
        ),
    },
    "support_contact": {
        "ru": "💬 Поддержка: @rassvetmr",
        "en": "💬 Support: @rassvetmr",
    },
    "friend_fallback": {"ru": "друг", "en": "friend"},
    "welcome_new": {
        "ru": (
            "Привет, {name}! 👋\n\n"
            "Добро пожаловать в Zenit Ai — всё это доступно в одном приложении:\n\n"
            "{features}\n\n"
            "Вам открыт бесплатный доступ уровня Starter на 3 дня. Нажмите кнопку ниже, чтобы начать.\n\n"
            "{support}"
        ),
        "en": (
            "Hi, {name}! 👋\n\n"
            "Welcome to Zenit Ai — it's all available in one app:\n\n"
            "{features}\n\n"
            "You've got free Starter-tier access for 3 days. Tap the button below to get started.\n\n"
            "{support}"
        ),
    },
    "welcome_back": {
        "ru": (
            "С возвращением, {name}! 👋\n\n"
            "Напомню, что доступно:\n\n{features}\n\n"
            "Откройте приложение, чтобы продолжить.\n\n"
            "{support}"
        ),
        "en": (
            "Welcome back, {name}! 👋\n\n"
            "Here's what's available:\n\n{features}\n\n"
            "Open the app to continue.\n\n"
            "{support}"
        ),
    },
    "webapp_button": {"ru": "Открыть приложение", "en": "Open the app"},
    "open_app_prompt": {"ru": "Открыть приложение:", "en": "Open the app:"},
    "help": {
        "ru": (
            "<b>Доступные команды</b>\n\n"
            "/app — открыть приложение\n"
            "/stats — моя статистика и подписка\n"
            "/invite — пригласить друзей и получить бонус\n"
            "/support &lt;текст&gt; — написать в поддержку\n"
            "/help — это сообщение"
        ),
        "en": (
            "<b>Available commands</b>\n\n"
            "/app — open the app\n"
            "/stats — my stats and subscription\n"
            "/invite — invite friends and earn a bonus\n"
            "/support &lt;text&gt; — contact support\n"
            "/help — this message"
        ),
    },
    "not_registered": {
        "ru": "Вы ещё не зарегистрированы. Отправьте /start, чтобы начать.",
        "en": "You're not registered yet. Send /start to get going.",
    },
    "stats": {
        "ru": (
            "<b>Тариф:</b> {tier}\n"
            "<b>Действует до:</b> {expires}\n"
            "<b>Запросов сегодня:</b> {today}\n"
            "<b>Запросов за месяц:</b> {month}"
        ),
        "en": (
            "<b>Plan:</b> {tier}\n"
            "<b>Valid until:</b> {expires}\n"
            "<b>Requests today:</b> {today}\n"
            "<b>Requests this month:</b> {month}"
        ),
    },
    "invite_intro": {
        "ru": (
            "🎁 <b>Приглашайте друзей — получайте бонусный доступ</b>\n\n"
            "Когда друг перейдёт по вашей ссылке и оформит любую платную подписку — "
            "вы получите бонусные дни расширенного тарифа."
        ),
        "en": (
            "🎁 <b>Invite friends — earn bonus access</b>\n\n"
            "When a friend follows your link and gets any paid subscription — "
            "you get bonus days of an upgraded plan."
        ),
    },
    "invite_milestone_line": {
        "ru": "{count} друг(ей) с подпиской — {label}",
        "en": "{count} friend(s) subscribed — {label}",
    },
    "invite_progress_next": {
        "ru": "До следующего бонуса ({label}): {qualified}/{required} друзей оформили подписку.",
        "en": "Until the next bonus ({label}): {qualified}/{required} friends have subscribed.",
    },
    "invite_progress_done": {
        "ru": "Вы получили все текущие бонусы за рефералов! Друзей с подпиской: {qualified}.",
        "en": "You've claimed every current referral bonus! Friends subscribed: {qualified}.",
    },
    "invite_link_label": {"ru": "Ваша ссылка:", "en": "Your link:"},
    "support_usage": {
        "ru": "Опишите проблему в формате: /support ваш вопрос",
        "en": "Describe your issue like this: /support your question",
    },
    "support_thanks_pending": {
        "ru": "Спасибо! Поддержка получит ваше сообщение в ближайшее время.",
        "en": "Thanks! Support will get your message shortly.",
    },
    "support_thanks_sent": {
        "ru": "Спасибо! Ваше сообщение передано в поддержку.",
        "en": "Thanks! Your message has been sent to support.",
    },
    "fallback": {
        "ru": "Не понял команду. Напишите /help, чтобы увидеть список доступных команд.",
        "en": "Didn't recognize that command. Send /help to see what's available.",
    },
    "open_app_cta": {
        "ru": "Откройте /app, чтобы воспользоваться.",
        "en": "Open /app to use it.",
    },
    "referral_bonus_thanks": {
        "ru": "🎉 Спасибо, что делитесь Zenit Ai! Уже {count} друзей оформили подписку по вашей ссылке.",
        "en": "🎉 Thanks for sharing Zenit Ai! {count} friends have subscribed through your link so far.",
    },
    "referral_bonus_reward": {
        "ru": "Награда: {label}.",
        "en": "Reward: {label}.",
    },
    "level_up_title": {
        "ru": "🏆 Новый уровень: <b>{level}</b>!",
        "en": "🏆 New level: <b>{level}</b>!",
    },
    "level_up_reward": {
        "ru": "Награда: {reward}",
        "en": "Reward: {reward}",
    },
    "subscription_ended": {
        "ru": (
            "⌛ Тариф {tier} закончился.\n\n"
            "Оформите подписку Starter, Pro или VIP в приложении, чтобы продолжить пользоваться "
            "текстом, изображениями и видео от лучших ИИ-моделей.\n\n"
            "Откройте /app → Профиль, чтобы выбрать тариф."
        ),
        "en": (
            "⌛ Your {tier} plan has ended.\n\n"
            "Subscribe to Starter, Pro, or VIP in the app to keep using text, image, and video generation "
            "from the best AI models.\n\n"
            "Open /app → Profile to pick a plan."
        ),
    },
    "reward_expired": {
        "ru": (
            "⌛ Бонусный доступ уровня {tier} за активность закончился — "
            "это была награда за уровень в разделе «Профиль».\n\n"
            "Действует ваш обычный тариф ({real_tier}). "
            "Продолжайте пользоваться приложением, чтобы заработать следующую награду, "
            "или оформите подписку в /app → Профиль."
        ),
        "en": (
            "⌛ Your bonus {tier} access from an activity reward has ended — "
            "that was a reward from the «Profile» section.\n\n"
            "Your regular plan ({real_tier}) is active. "
            "Keep using the app to earn the next reward, "
            "or subscribe in /app → Profile."
        ),
    },
    "subscription_expiring": {
        "ru": "⏳ Ваша подписка {tier} истекает {date}. Откройте /app, чтобы продлить.",
        "en": "⏳ Your {tier} subscription expires on {date}. Open /app to renew.",
    },
    "near_limit": {
        "ru": "⚡️ Вы использовали {today}/{limit} запросов на сегодня. Апгрейдните тариф в /app, чтобы снять ограничение.",
        "en": "⚡️ You've used {today}/{limit} requests today. Upgrade your plan in /app to lift the limit.",
    },
    "marathon_day_unlocked": {
        "ru": "🔥 Марафон «Заработок на ИИ»: открыт день {day} — {title}.\n\nОткройте /app → Заработок → Марафон.",
        "en": "🔥 «Earn with AI» marathon: day {day} is now unlocked — {title}.\n\nOpen /app → Earn → Marathon.",
    },
}


def t(lang: str | None, key: str, **kwargs: Any) -> str:
    lang = lang if lang in ("ru", "en") else "ru"
    template = _MESSAGES[key][lang]
    return template.format(**kwargs) if kwargs else template
