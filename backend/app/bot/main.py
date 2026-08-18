import asyncio
import logging

from app.bot.dispatcher import create_bot, create_dispatcher
from app.bot.notify import run_daily_notifications
from app.db import init_db

logging.basicConfig(level=logging.INFO)


async def main() -> None:
    await init_db()

    bot = create_bot()
    dp = create_dispatcher(bot)

    asyncio.create_task(run_daily_notifications(bot))

    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
