from aiogram import Bot, F, Router
from aiogram.filters import Command, CommandObject
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, Message, WebAppInfo
from sqlalchemy import select

from app.config import settings
from app.db import async_session
from app.models.user import User
from app.services.user import get_or_create_user

router = Router()

HELP_TEXT = (
    "<b>Доступные команды</b>\n\n"
    "/app — открыть приложение\n"
    "/stats — моя статистика и подписка\n"
    "/support &lt;текст&gt; — написать в поддержку\n"
    "/help — это сообщение"
)


def _webapp_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text="Открыть приложение", web_app=WebAppInfo(url=settings.mini_app_url))]]
    )


@router.message(Command("start"))
async def cmd_start(message: Message) -> None:
    async with async_session() as db:
        user, is_new = await get_or_create_user(
            db, message.from_user.id, message.from_user.username, message.from_user.first_name
        )

    name = message.from_user.first_name or (f"@{message.from_user.username}" if message.from_user.username else "друг")
    features = (
        "💬 <b>Текст</b> — Claude Sonnet 5, GPT-4o mini\n"
        "🎨 <b>Фото</b> — Flux.1 Pro\n"
        "🎬 <b>Видео</b> — MiniMax Video-01\n"
        "✨ <b>Промпты</b> — библиотека готовых запросов"
    )

    support = "💬 Поддержка: @rassvetmr"

    if is_new:
        text = (
            f"Привет, {name}! 👋\n\n"
            f"Добро пожаловать в Zenit Ai — всё это доступно в одном приложении:\n\n"
            f"{features}\n\n"
            "Вам открыт бесплатный доступ уровня Starter на 3 дня. Нажмите кнопку ниже, чтобы начать.\n\n"
            f"{support}"
        )
    else:
        text = (
            f"С возвращением, {name}! 👋\n\n"
            f"Напомню, что доступно:\n\n{features}\n\n"
            f"Откройте приложение, чтобы продолжить.\n\n"
            f"{support}"
        )

    await message.answer(text, reply_markup=_webapp_keyboard())


@router.message(Command("app"))
async def cmd_app(message: Message) -> None:
    await message.answer("Открыть приложение:", reply_markup=_webapp_keyboard())


@router.message(Command("help"))
async def cmd_help(message: Message) -> None:
    await message.answer(HELP_TEXT)


@router.message(Command("stats"))
async def cmd_stats(message: Message) -> None:
    async with async_session() as db:
        result = await db.execute(select(User).where(User.telegram_user_id == message.from_user.id))
        user = result.scalar_one_or_none()

    if user is None:
        await message.answer("Вы ещё не зарегистрированы. Отправьте /start, чтобы начать.")
        return

    expires = user.subscription_expires_at.strftime("%d.%m.%Y") if user.subscription_expires_at else "—"
    text = (
        f"<b>Тариф:</b> {user.subscription_tier.value}\n"
        f"<b>Действует до:</b> {expires}\n"
        f"<b>Запросов сегодня:</b> {user.requests_today}\n"
        f"<b>Запросов за месяц:</b> {user.requests_month}"
    )
    await message.answer(text)


@router.message(Command("support"))
async def cmd_support(message: Message, command: CommandObject, bot: Bot) -> None:
    if not command.args:
        await message.answer("Опишите проблему в формате: /support ваш вопрос")
        return

    if not settings.telegram_admin_chat_id:
        await message.answer("Спасибо! Поддержка получит ваше сообщение в ближайшее время.")
        return

    user = message.from_user
    await bot.send_message(
        settings.telegram_admin_chat_id,
        f"📩 Обращение от @{user.username or user.id} (id={user.id}):\n\n{command.args}",
    )
    await message.answer("Спасибо! Ваше сообщение передано в поддержку.")


@router.message(F.text)
async def fallback(message: Message) -> None:
    await message.answer("Не понял команду. Напишите /help, чтобы увидеть список доступных команд.")
