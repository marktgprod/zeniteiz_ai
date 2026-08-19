# Zeniteiz Ai

Telegram Mini App — платформа для монетизации доступа к топовым ИИ-моделям (текст, изображения, видео) через подписки Tribute.

## Контекст проекта

- **Платформа:** Telegram Mini App (веб-приложение внутри Telegram)
- **Монетизация:** подписки Tribute (Starter / Pro / VIP)
- **Аудитория:** русскоязычные пользователи (Россия, СНГ), интересующиеся ИИ
- **Канал продвижения:** Telegram-канал 1000+ подписчиков

## ИИ-модели к интеграции

**Текст/рассуждение:**
- Claude Sonnet 5 (Anthropic) — основная модель для анализа и рассуждений
- GPT-4o mini (OpenAI) — универсальная, популярная модель

**Изображения:**
- Flux.1 Pro (Together AI) — лучшее качество
- DALL-E 3 (OpenAI) — интеграция с GPT

**Видео:**
- Runway Gen-3 (FAL.AI)
- Sora (OpenAI) — опционально, если появится доступ

**API-платформы:**
- OpenRouter — единая точка для Claude/GPT/Gemini
- Together AI — Flux.1 Pro
- FAL.AI — Runway Gen-3 и др.

## Технический стек

**Frontend (Mini App):** React 18+ (TypeScript), Telegram WebApp SDK, TailwindCSS или Material-UI, Zustand/Redux, Axios, Vite. Хостинг: Vercel/Netlify.

**Backend + Telegram Bot:** Python 3.11+, aiogram 3.x, FastAPI, Redis (кэш/сессии), SQLAlchemy, python-dotenv, aiohttp, pydantic.

**Database:** Supabase (PostgreSQL), free tier на старте.

**Хостинг backend:** Railway (или Heroku/Render/Replit), Docker.

**Платежи:** Telegram Tribute API, webhook-обработка, статусы подписок в Supabase.

**Мониторинг:** Sentry (ошибки), admin-чат в Telegram (логи бота).

## Модель подписок (Tribute)

**STARTER — 3 €/мес**
- Claude Sonnet 5 + GPT-4o mini (текст)
- До 50 запросов/день
- Библиотека 1000+ промптов (просмотр)
- Ежедневный digest AI-новостей, доступ в сообщество, email-поддержка

**PRO — 8 €/мес**
- Всё из STARTER +
- Flux.1 Pro (изображения)
- До 100 запросов/день
- Промпт-генератор, приоритетная поддержка, еженедельные вебинары

**VIP — 40 €/год**
- Всё из PRO +
- MiniMax Video-01 (видео)
- Безлимит (5000+ запросов/день)
- Ранний доступ к новым моделям, личный чат с разработчиком, экспорт в высоком качестве

**FREE TRIAL:** 3 дня доступа уровня Starter, без карты, только для новых пользователей.

## Структура Mini App (навигация)

1. **Главная** — статус подписки, быстрые действия, статистика использования
2. **Текст** — табы Claude/GPT-4o mini, история чатов, параметры (temperature, max tokens), «улучшить промпт»
3. **Изображения** — табы Flux.1 Pro/DALL-E 3, промпт-генератор (PRO+), галерея, download/share
4. **Видео** (VIP) — описание сцены, длительность/качество, preview, download/share
5. **Промпты** — поиск по категориям, избранное (PRO+)
6. **Новости ИИ** — ежедневный digest, архив 30 новостей
7. **Сообщество** — ссылка на закрытую группу, FAQ
8. **Профиль/Подписка** — статус, лимиты, история платежей, апгрейд через Tribute, настройки

## Интеграция с Tribute

1. Пользователь жмёт «Подписаться» → открывается Tribute checkout
2. Tribute шлёт webhook на backend (`POST /webhook/tribute`) с проверкой подписи
3. Backend атомарно обновляет статус подписки в БД, шлёт подтверждение через бота, логирует платёж
4. Mini App при следующей загрузке подтягивает новый статус через `GET /api/user/{user_id}/subscription`

## Telegram Bot — команды

- `/start` — статус подписки + ссылка на Mini App
- `/app` — инлайн-кнопка на Mini App
- `/help` — FAQ и список команд
- `/stats` — личная статистика
- `/support` — форма обратной связи

Автоуведомления: окончание подписки (за 3 дня), 80% лимита запросов, новые функции, приветствие + free trial новым пользователям.

## Схема БД (Supabase)

- **users** — telegram_user_id, username, subscription_tier, subscription_expires_at, requests_today/month, created_at, last_active
- **subscriptions** — user_id, tier, amount, payment_method, status, started_at, expires_at, tribute_transaction_id
- **api_requests** — user_id, model, request_type, input/output_tokens, cost, status, created_at
- **prompts** — title, description, category, prompt_text, model_type, rating
- **user_favorites** — user_id, prompt_id

## API Endpoints

**Auth/User:** `GET /api/auth/user/{user_id}`, `POST /api/auth/login`, `GET /api/user/{user_id}/subscription`

**Текст:** `POST /api/text/claude`, `POST /api/text/gpt4o`, `GET /api/user/{user_id}/text-history`

**Изображения:** `POST /api/image/flux`, `POST /api/image/dalle3`, `POST /api/image/generate-prompt`, `GET /api/user/{user_id}/image-history`

**Видео:** `POST /api/video/runway`, `GET /api/user/{user_id}/video-history`

**Промпты:** `GET /api/prompts`, `GET /api/prompts/{id}`, `GET /api/prompts/category/{category}`, `POST/GET /api/user/{user_id}/favorites`

**Новости:** `GET /api/news`, `GET /api/news/{id}`

**Платежи:** `POST /webhook/tribute`, `GET /api/user/{user_id}/payments`, `POST /api/user/{user_id}/upgrade`

## Этапы разработки (30 дней)

**Неделя 1 — базовая структура:** React (Vite) + FastAPI, Supabase schema/migrations, Telegram WebApp SDK, Layout/Navigation/Profile, авторизация через Telegram init data, деплой Vercel + Railway.

**Неделя 2 — ИИ текст:** OpenRouter (Claude + GPT-4o mini), TextInterface/ChatHistory/Parameters, rate limiting по подписке, логирование запросов, обработка ошибок.

**Неделя 3 — ИИ изображения + Tribute:** Together AI (Flux.1 Pro) + OpenAI (DALL-E 3), ImageGenerator/Gallery, Tribute webhook, логика подписок, проверка лимитов, кнопка Upgrade.

**Неделя 4 — видео и доп.:** FAL.AI (Runway Gen-3), VideoGenerator/Preview, библиотека промптов (150+), поиск/фильтрация, избранное (PRO+), сообщество, ежедневный digest, финальное тестирование.

## Важные принципы

**Безопасность:** все ключи в `.env`, проверка Telegram WebApp signature, rate limiting на каждый endpoint, валидация через Pydantic, CORS только для своего фронтенда.

**Обработка ошибок:** try/catch вокруг всех внешних запросов, user-friendly сообщения, fallback UI, логирование в Sentry + собственный logger.

**Производительность:** кэширование промптов в Redis, ленивая загрузка изображений, debounce на поиск, code splitting, CDN для статики.

**Масштабируемость:** async/await везде в Python, очередь для долгих операций (генерация видео), stateless backend.

**Telegram-интеграция:** official Telegram WebApp API, проверка запуска внутри Telegram, поддержка тёмной темы, обработка back button.
