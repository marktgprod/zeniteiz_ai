import type { Language } from '../store/userStore'

export type EarnMode = 'text' | 'image' | 'video'

type L = Record<Language, string>

export interface CaseStudy {
  id: string
  title: L
  steps: L
  price: L
}

export interface ToolkitPrompt {
  id: string
  title: L
  description: L
  prompt: L
  mode: EarnMode
}

export interface NicheGuide {
  id: string
  title: L
  description: L
  price: L
  platforms: string[]
}

export interface QuizOption {
  text: L
  correct: boolean
}

export interface CourseLesson {
  id: string
  title: L
  body: L
  quizQuestion: L
  quizOptions: QuizOption[]
  tryPrompt?: L
  tryMode?: EarnMode
}

export interface MarathonDay {
  day: number
  title: L
  task: L
  prompt?: L
  mode?: EarnMode
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'logos',
    title: { ru: 'Лого и айдентика для малого бизнеса', en: 'Logos & branding for small businesses' },
    steps: {
      ru: 'Берёте бриф у клиента (название, сфера, стиль) → генерируете 5–10 концептов лого в разделе «ИИ» → показываете клиенту 2–3 лучших варианта → дорабатываете по фидбеку и отдаёте файлы.',
      en: 'Get a brief from the client (name, industry, style) → generate 5–10 logo concepts in the AI tab → show the client 2–3 best options → refine based on feedback and deliver the files.',
    },
    price: { ru: '15–50 € за лого', en: '€15–50 per logo' },
  },
  {
    id: 'copywriting',
    title: { ru: 'Рекламные тексты и объявления', en: 'Ad copy and listings' },
    steps: {
      ru: 'Находите локальный бизнес без хороших текстов → пишете 3–5 вариантов рекламного поста с помощью ИИ → предлагаете лучший бесплатно как демо → продаёте пакет из 10 текстов.',
      en: 'Find a local business with weak copy → draft 3–5 ad variations with AI → offer the best one free as a demo → sell a pack of 10 pieces.',
    },
    price: { ru: '5–30 € за текст', en: '€5–30 per piece' },
  },
  {
    id: 'shortvideo',
    title: { ru: 'Короткие рекламные видео для соцсетей', en: 'Short ad videos for social media' },
    steps: {
      ru: 'Собираете идею и сценарий сцены → генерируете короткий видеоролик в разделе «ИИ» (тариф VIP) → монтируете с текстом/музыкой в любом простом редакторе → продаёте как Reels/TikTok-рекламу.',
      en: 'Draft an idea and scene script → generate a short clip in the AI tab (VIP plan) → add text/music in any simple editor → sell it as Reels/TikTok ad content.',
    },
    price: { ru: '10–50 € за ролик', en: '€10–50 per clip' },
  },
  {
    id: 'resumes',
    title: { ru: 'Резюме и сопроводительные письма', en: 'Resumes and cover letters' },
    steps: {
      ru: 'Клиент присылает свой опыт → вы формулируете структурированный промпт в разделе «ИИ» → получаете черновик резюме и письма за минуты → редактируете под клиента и отдаёте готовый документ.',
      en: 'The client sends their experience → you turn it into a prompt in the AI tab → get a resume and letter draft in minutes → edit for the client and deliver the finished document.',
    },
    price: { ru: '5–20 € за резюме', en: '€5–20 per resume' },
  },
]

export const TOOLKIT_PROMPTS: ToolkitPrompt[] = [
  {
    id: 'logo-concepts',
    title: { ru: '5 концептов лого', en: '5 logo concepts' },
    description: { ru: 'Готовые варианты лого для показа клиенту', en: 'Ready logo options to show a client' },
    prompt: {
      ru: 'Минималистичный логотип для бизнеса «[название]» в сфере [ниша], плоский векторный стиль, один акцентный цвет, белый фон',
      en: 'Minimalist logo for a [industry] business called "[name]", flat vector style, single accent color, white background',
    },
    mode: 'image',
  },
  {
    id: 'ad-post',
    title: { ru: 'Рекламный пост для соцсетей', en: 'Social media ad post' },
    description: { ru: 'Цепляющий текст с призывом к действию', en: 'Catchy copy with a call to action' },
    prompt: {
      ru: 'Напиши цепляющий рекламный текст для Instagram/VK для бизнеса [опишите бизнес], тон дружелюбный, с призывом к действию, не более 500 знаков',
      en: 'Write a catchy Instagram/Facebook ad post for [describe business], friendly tone, with a call to action, under 500 characters',
    },
    mode: 'text',
  },
  {
    id: 'proposal',
    title: { ru: 'Коммерческое предложение', en: 'Business proposal' },
    description: { ru: 'Структура: проблема → решение → цена → CTA', en: 'Structure: problem → solution → price → CTA' },
    prompt: {
      ru: 'Составь короткое коммерческое предложение для услуги [опишите услугу] для клиента из ниши [ниша клиента]. Структура: проблема — решение — цена — призыв к действию',
      en: 'Write a short business proposal for a [describe service] service for a client in [client niche]. Structure: problem — solution — price — call to action',
    },
    mode: 'text',
  },
  {
    id: 'product-desc',
    title: { ru: 'Продающее описание товара', en: 'Product listing copy' },
    description: { ru: 'Для маркетплейсов Wildberries/Ozon/Etsy', en: 'For marketplaces like Etsy/Amazon' },
    prompt: {
      ru: 'Напиши продающее описание товара [название и характеристики товара] для маркетплейса, с акцентом на выгоды для покупателя, до 800 знаков',
      en: 'Write a sales-focused product description for [product name and features] for a marketplace listing, emphasizing buyer benefits, under 800 characters',
    },
    mode: 'text',
  },
  {
    id: 'video-script',
    title: { ru: 'Сценарий короткого видео', en: 'Short video script' },
    description: { ru: 'Сцены, текст на экране, призыв к действию', en: 'Scenes, on-screen text, call to action' },
    prompt: {
      ru: 'Напиши сценарий 15-секундного рекламного видео для бизнеса [опишите бизнес]: список сцен, текст на экране, призыв к действию',
      en: 'Write a script for a 15-second ad video for [describe business]: scene list, on-screen text, call to action',
    },
    mode: 'text',
  },
  {
    id: 'resume',
    title: { ru: 'Резюме и сопроводительное письмо', en: 'Resume and cover letter' },
    description: { ru: 'Профессиональное оформление за минуты', en: 'Professional formatting in minutes' },
    prompt: {
      ru: 'Составь профессиональное резюме и короткое сопроводительное письмо для позиции [должность] на основе опыта: [впишите опыт кандидата]',
      en: 'Write a professional resume and short cover letter for the position of [job title] based on this experience: [candidate experience]',
    },
    mode: 'text',
  },
]

export const NICHE_GUIDES: NicheGuide[] = [
  {
    id: 'logos',
    title: { ru: 'Лого и брендинг', en: 'Logos & branding' },
    description: { ru: 'Простые логотипы и фирменный стиль для локального бизнеса', en: 'Simple logos and brand identity for local businesses' },
    price: { ru: '10–50 € за лого', en: '€10–50 per logo' },
    platforms: ['Kwork', 'Avito Услуги', 'Instagram'],
  },
  {
    id: 'copy',
    title: { ru: 'Копирайтинг и реклама', en: 'Copywriting & ads' },
    description: { ru: 'Рекламные тексты, посты, email-рассылки', en: 'Ad copy, posts, email sequences' },
    price: { ru: '5–30 € за текст', en: '€5–30 per piece' },
    platforms: ['Kwork', 'Weblancer', 'Прямые клиенты'],
  },
  {
    id: 'smm',
    title: { ru: 'Ведение соцсетей', en: 'Social media management' },
    description: { ru: 'Посты и картинки для бизнес-аккаунтов', en: 'Posts and images for business accounts' },
    price: { ru: '30–150 €/мес', en: '€30–150/mo' },
    platforms: ['Instagram', 'VK', 'Telegram-каналы'],
  },
  {
    id: 'video',
    title: { ru: 'Короткие видео-ролики', en: 'Short-form video' },
    description: { ru: 'Reels/TikTok для локального бизнеса', en: 'Reels/TikTok for local businesses' },
    price: { ru: '10–50 € за видео', en: '€10–50 per video' },
    platforms: ['TikTok', 'Instagram Reels'],
  },
  {
    id: 'resumes',
    title: { ru: 'Резюме и письма', en: 'Resumes & letters' },
    description: { ru: 'Составление резюме под конкретную вакансию', en: 'Tailored resumes for specific job postings' },
    price: { ru: '5–20 € за резюме', en: '€5–20 per resume' },
    platforms: ['Avito Услуги', 'Сообщества HR в Telegram'],
  },
  {
    id: 'automation',
    title: { ru: 'Тексты и автоматизация для бизнеса', en: 'Business text automation' },
    description: { ru: 'Шаблоны ответов, скрипты, FAQ для малого бизнеса', en: 'Response templates, scripts, FAQs for small businesses' },
    price: { ru: 'от 50 € за проект', en: 'from €50 per project' },
    platforms: ['Прямые клиенты', 'Telegram-группы предпринимателей'],
  },
]

export const MARATHON_DAYS: MarathonDay[] = [
  {
    day: 1,
    title: { ru: 'Первый текст', en: 'First AI text' },
    task: {
      ru: 'Освойте генерацию текста: попросите ИИ написать 3 варианта рекламного поста для вымышленного бизнеса.',
      en: 'Get comfortable with text generation: ask the AI for 3 ad-post variants for a made-up business.',
    },
    prompt: {
      ru: 'Напиши 3 варианта короткого рекламного поста для кофейни в Instagram, дружелюбный тон',
      en: 'Write 3 short Instagram ad post variants for a coffee shop, friendly tone',
    },
    mode: 'text',
  },
  {
    day: 2,
    title: { ru: 'Первое лого', en: 'First logo' },
    task: {
      ru: 'Сгенерируйте 5 концептов лого для вымышленного бренда и выберите лучший.',
      en: 'Generate 5 logo concepts for a made-up brand and pick your favorite.',
    },
    prompt: {
      ru: "Минималистичный логотип для бренда одежды 'Aura', плоский векторный стиль, один акцентный цвет",
      en: 'Minimalist logo for a clothing brand called "Aura", flat vector style, single accent color',
    },
    mode: 'image',
  },
  {
    day: 3,
    title: { ru: 'Коммерческое предложение', en: 'Business proposal' },
    task: {
      ru: 'Напишите коммерческое предложение для услуги, которую вы могли бы продавать.',
      en: 'Write a business proposal for a service you could actually sell.',
    },
    prompt: {
      ru: 'Составь короткое коммерческое предложение услуги «ведение соцсетей» для владельца кофейни',
      en: 'Write a short business proposal for a "social media management" service aimed at a coffee shop owner',
    },
    mode: 'text',
  },
  {
    day: 4,
    title: { ru: 'Портфолио', en: 'Portfolio' },
    task: {
      ru: 'Сгенерируйте 3 изображения для портфолио — например, лого в разных стилях.',
      en: 'Generate 3 portfolio images — for example, logos in different styles.',
    },
    prompt: {
      ru: "Сгенерируй логотип в стиле минимализм для бренда 'Nord'",
      en: 'Generate a minimalist-style logo for a brand called "Nord"',
    },
    mode: 'image',
  },
  {
    day: 5,
    title: { ru: 'Видео-визитка', en: 'Video showcase' },
    task: {
      ru: 'Попробуйте создать короткий рекламный видеоролик (доступно на тарифе VIP).',
      en: 'Try creating a short ad video clip (available on the VIP plan).',
    },
    prompt: {
      ru: 'Короткое видео: чашка кофе на деревянном столе, утренний свет, атмосферно',
      en: 'Short video: a cup of coffee on a wooden table, morning light, atmospheric',
    },
    mode: 'video',
  },
  {
    day: 6,
    title: { ru: 'Первое объявление', en: 'First listing' },
    task: {
      ru: 'Создайте профиль фрилансера на Kwork или Avito Услуги и опубликуйте первую услугу, используя промпты из «Тулкита».',
      en: 'Create a freelancer profile on Kwork or a local services marketplace and publish your first listing using prompts from the Toolkit.',
    },
  },
  {
    day: 7,
    title: { ru: 'Итоги недели', en: 'Weekly wrap-up' },
    task: {
      ru: 'Соберите мини-портфолио из созданного за неделю и составьте план продвижения на следующую неделю.',
      en: 'Put together a mini-portfolio from what you made this week and plan your next week.',
    },
    prompt: {
      ru: 'Помоги составить план продвижения моих услуг на следующую неделю, основываясь на том, что я создал за 7 дней: [опишите, что вы сделали]',
      en: 'Help me plan how to promote my services next week, based on what I made over the past 7 days: [describe what you made]',
    },
    mode: 'text',
  },
]

export const COURSE_LESSONS: CourseLesson[] = [
  {
    id: 'what-is-ai',
    title: { ru: 'Что такое ИИ-модели', en: 'What AI models actually are' },
    body: {
      ru: 'Большая языковая модель (LLM), такая как Claude или GPT-4o, не «ищет» ответ в интернете и не хранит готовые фразы — она предсказывает наиболее вероятное продолжение текста на основе того, чему научилась на огромном объёме данных. Модели для изображений и видео (Flux, MiniMax) работают похоже, но предсказывают пиксели, а не слова. Понимание этого помогает писать промпты: чем точнее и конкретнее вход — тем точнее выход.',
      en: "A large language model (LLM) like Claude or GPT-4o doesn't \"search\" the internet or store canned answers — it predicts the most likely continuation of text based on patterns learned from huge amounts of data. Image and video models (Flux, MiniMax) work similarly, but predict pixels instead of words. Understanding this helps you write better prompts: the more precise the input, the more precise the output.",
    },
    quizQuestion: { ru: 'Что делает большая языковая модель (LLM)?', en: 'What does a large language model (LLM) do?' },
    quizOptions: [
      { text: { ru: 'Ищет готовый ответ в интернете в реальном времени', en: 'Searches the internet for a ready answer in real time' }, correct: false },
      { text: { ru: 'Предсказывает наиболее вероятное продолжение текста', en: 'Predicts the most likely continuation of the text' }, correct: true },
      { text: { ru: 'Хранит базу заранее написанных ответов', en: 'Stores a database of pre-written answers' }, correct: false },
    ],
    tryPrompt: {
      ru: 'Объясни простыми словами, что такое большая языковая модель (LLM), с одной аналогией из жизни',
      en: 'Explain in simple terms what a large language model (LLM) is, using one everyday analogy',
    },
    tryMode: 'text',
  },
  {
    id: 'prompting-basics',
    title: { ru: 'Основы промптинга', en: 'Prompting basics' },
    body: {
      ru: 'Хороший промпт обычно включает: роль («ты — опытный копирайтер»), контекст (для кого и зачем), формат (сколько вариантов, длина, стиль) и, если важно, пример. Плохой промпт — это одно слово или общая фраза без деталей. Чем конкретнее задача, тем меньше правок потребуется.',
      en: 'A good prompt usually includes: a role ("you are an experienced copywriter"), context (who it\'s for and why), format (how many variants, length, style), and an example if it matters. A bad prompt is a single vague word with no details. The more specific the task, the fewer edits you\'ll need afterward.',
    },
    quizQuestion: { ru: 'Какой промпт даст более предсказуемый результат?', en: 'Which prompt gives a more predictable result?' },
    quizOptions: [
      { text: { ru: '«Напиши текст»', en: '"Write some text"' }, correct: false },
      { text: { ru: 'Промпт с ролью, контекстом и форматом ответа', en: 'A prompt with a role, context, and response format' }, correct: true },
      { text: { ru: 'Промпт, написанный капсом', en: 'A prompt written in all caps' }, correct: false },
    ],
    tryPrompt: {
      ru: 'Ты — опытный копирайтер. Напиши 3 варианта заголовка для рекламного поста кофейни, тон дружелюбный, до 60 символов каждый',
      en: 'You are an experienced copywriter. Write 3 headline variants for a coffee shop ad post, friendly tone, under 60 characters each',
    },
    tryMode: 'text',
  },
  {
    id: 'text-models',
    title: { ru: 'Claude vs GPT-4o mini — что выбрать', en: 'Claude vs GPT-4o mini — which to pick' },
    body: {
      ru: 'GPT-4o mini быстрее и дешевле — хорош для коротких задач: пост, описание, короткое письмо. Claude Sonnet сильнее в сложных рассуждениях, анализе и длинных структурированных текстах — коммерческие предложения, разбор стратегии, код. Правило: для быстрой рутины — GPT-4o mini, для задач, где важна глубина — Claude.',
      en: "GPT-4o mini is faster and cheaper — good for short tasks: a post, a description, a short message. Claude Sonnet is stronger at complex reasoning, analysis, and long structured text — proposals, strategy breakdowns, code. Rule of thumb: quick routine work → GPT-4o mini, tasks that need depth → Claude.",
    },
    quizQuestion: { ru: 'Когда стоит выбрать более мощную модель (Claude)?', en: 'When should you pick the more powerful model (Claude)?' },
    quizOptions: [
      { text: { ru: 'Для сложного анализа и длинных структурированных текстов', en: 'For complex analysis and long structured text' }, correct: true },
      { text: { ru: 'Только для сообщений короче 10 слов', en: 'Only for messages shorter than 10 words' }, correct: false },
      { text: { ru: 'Разницы нет, модели всегда взаимозаменяемы', en: "It doesn't matter, the models are always interchangeable" }, correct: false },
    ],
    tryPrompt: {
      ru: 'Сравни фриланс и работу по найму для новичка в ИИ-услугах — дай структурированный ответ с плюсами, минусами и рекомендацией',
      en: 'Compare freelancing vs. a full-time job for someone starting out with AI services — give a structured answer with pros, cons, and a recommendation',
    },
    tryMode: 'text',
  },
  {
    id: 'image-models',
    title: { ru: 'Генерация изображений', en: 'Image generation' },
    body: {
      ru: 'Для предсказуемого результата опишите: стиль (минимализм, реализм, флэт), композицию (крупный план, вид сверху), освещение, цвета и то, чего быть не должно. Короткие абстрактные промпты («красивое лого») дают случайный результат — детали решают.',
      en: "For a predictable result, describe: style (minimalist, realistic, flat), composition (close-up, top-down), lighting, colors, and what should be avoided. Short abstract prompts (\"a nice logo\") give random results — details are what make it work.",
    },
    quizQuestion: { ru: 'Что стоит указать в промпте для изображения?', en: 'What should you specify in an image prompt?' },
    quizOptions: [
      { text: { ru: 'Стиль, композицию, освещение и детали', en: 'Style, composition, lighting, and details' }, correct: true },
      { text: { ru: 'Только одно слово', en: 'Just one word' }, correct: false },
      { text: { ru: 'Ничего — ИИ сам всё придумает как надо', en: "Nothing — the AI will figure it out on its own" }, correct: false },
    ],
    tryPrompt: {
      ru: 'Логотип для кофейни в стиле минимализм, тёплые тона, плоская векторная графика, белый фон',
      en: 'Logo for a coffee shop, minimalist style, warm tones, flat vector graphics, white background',
    },
    tryMode: 'image',
  },
  {
    id: 'video-models',
    title: { ru: 'Генерация видео', en: 'Video generation' },
    body: {
      ru: 'Видео-модели лучше всего работают с чётким описанием одной сцены: что происходит, какое движение камеры или объекта, какое настроение. Пока не стоит ожидать сложных сюжетов с несколькими сценами за один запрос — короткие атмосферные ролики получаются лучше всего.',
      en: 'Video models work best with a clear description of a single scene: what happens, what camera or object movement, what mood. Don\'t expect complex multi-scene stories from one request yet — short atmospheric clips work best.',
    },
    quizQuestion: { ru: 'Какой промпт для видео сработает лучше?', en: 'Which video prompt works better?' },
    quizOptions: [
      { text: { ru: 'Чёткое описание одной сцены, движения и настроения', en: 'A clear description of one scene, movement, and mood' }, correct: true },
      { text: { ru: 'Одно абстрактное слово', en: 'A single abstract word' }, correct: false },
      { text: { ru: 'Ссылка на чужое видео', en: "A link to someone else's video" }, correct: false },
    ],
    tryPrompt: {
      ru: 'Короткое видео: чашка кофе на деревянном столе, лёгкий пар, утренний свет, камера медленно приближается',
      en: 'Short video: a cup of coffee on a wooden table, light steam, morning light, camera slowly zooming in',
    },
    tryMode: 'video',
  },
  {
    id: 'iterative-prompting',
    title: { ru: 'Итеративный промптинг', en: 'Iterative prompting' },
    body: {
      ru: 'Лучший результат редко получается с первого раза — и это нормально. В текстовом чате история сохраняется, поэтому можно просто уточнить: «сделай короче», «добавь больше конкретики», «замени тон на более формальный». Каждое уточнение — это новый шаг диалога, а не новый промпт с нуля.',
      en: "The best result rarely comes on the first try — and that's normal. Chat history is saved in the text tab, so you can simply refine: \"make it shorter,\" \"add more specifics,\" \"make the tone more formal.\" Each refinement is a new step in the conversation, not a fresh prompt from scratch.",
    },
    quizQuestion: { ru: 'Как лучше всего улучшить не совсем точный результат?', en: 'What is the best way to improve a not-quite-right result?' },
    quizOptions: [
      { text: { ru: 'Написать уточнение следующим сообщением в этом же чате', en: 'Send a refinement as the next message in the same chat' }, correct: true },
      { text: { ru: 'Всегда начинать совершенно новый чат с нуля', en: 'Always start a brand new chat from scratch' }, correct: false },
      { text: { ru: 'Смириться с первым результатом', en: 'Just accept the first result' }, correct: false },
    ],
    tryPrompt: {
      ru: 'Напиши короткий пост для Instagram про открытие кофейни. Затем, если результат будет слишком длинным, я попрошу сократить — попробуй',
      en: 'Write a short Instagram post about a coffee shop opening. Keep it brief so we can iterate on tone afterward.',
    },
    tryMode: 'text',
  },
  {
    id: 'chat-context',
    title: { ru: 'Контекст и история переписки', en: 'Context and chat history' },
    body: {
      ru: 'Модель «помнит» всё, что было в текущем чате, и использует это как контекст для следующего ответа — это удобно для уточнений, но может мешать, если тема резко меняется: старый контекст иногда «тянет» ответ в прежнюю сторону. Если задача совсем новая и не связана с предыдущей — лучше нажать «Очистить» и начать чат заново.',
      en: 'The model "remembers" everything in the current chat and uses it as context for the next reply — handy for refinements, but it can get in the way when the topic changes sharply: old context sometimes pulls the answer in the wrong direction. If the task is completely new and unrelated to the previous one, it\'s better to hit "Clear" and start a fresh chat.',
    },
    quizQuestion: { ru: 'Когда стоит очистить историю чата?', en: 'When should you clear the chat history?' },
    quizOptions: [
      { text: { ru: 'Когда новая задача не связана с предыдущим разговором', en: "When the new task is unrelated to the previous conversation" }, correct: true },
      { text: { ru: 'Каждое сообщение, всегда', en: 'Every single message, always' }, correct: false },
      { text: { ru: 'Никогда, история не влияет на ответы', en: "Never — history has no effect on answers" }, correct: false },
    ],
  },
  {
    id: 'common-mistakes',
    title: { ru: 'Частые ошибки при промптинге', en: 'Common prompting mistakes' },
    body: {
      ru: 'Три самые частые ошибки: слишком общий запрос без деталей («напиши что-нибудь про бизнес»), противоречивые указания в одном промпте («коротко, но подробно обо всём») и отсутствие формата («напиши текст» вместо «3 варианта по 2 предложения»). Каждая мешает модели понять, что именно нужно.',
      en: 'The three most common mistakes: a too-generic request with no details ("write something about business"), contradictory instructions in one prompt ("short but cover everything in detail"), and no format specified ("write text" instead of "3 variants, 2 sentences each"). Each one makes it harder for the model to know exactly what you need.',
    },
    quizQuestion: { ru: 'Какая из этих формулировок — типичная ошибка?', en: 'Which of these is a typical mistake?' },
    quizOptions: [
      { text: { ru: '«Коротко, но подробно раскрой абсолютно всё»', en: '"Keep it short, but cover absolutely everything in detail"' }, correct: true },
      { text: { ru: '«Напиши 3 коротких заголовка, до 50 символов каждый»', en: '"Write 3 short headlines, under 50 characters each"' }, correct: false },
      { text: { ru: '«Опиши целевую аудиторию продукта X по трём критериям»', en: '"Describe product X\'s target audience across three criteria"' }, correct: false },
    ],
  },
  {
    id: 'image-iteration',
    title: { ru: 'Доработка изображений через промпт', en: 'Refining images through the prompt' },
    body: {
      ru: 'Прямого редактирования готового изображения в приложении пока нет — но можно «доработать» результат, переформулировав промпт: добавить то, чего не хватало, убрать лишнее словами «без...», уточнить цвет или ракурс. Каждая новая генерация — это новая попытка, поэтому проще всего менять по одному параметру за раз, чтобы понимать, что повлияло на результат.',
      en: "There's no direct editing of a finished image in the app yet — but you can \"refine\" the result by rewording the prompt: add what was missing, remove something with \"without...\", adjust the color or angle. Each new generation is a fresh attempt, so it's easiest to change one parameter at a time to understand what actually affected the result.",
    },
    quizQuestion: { ru: 'Как лучше всего доработать неидеальное изображение?', en: 'What is the best way to refine an imperfect image?' },
    quizOptions: [
      { text: { ru: 'Изменить один параметр в промпте и сгенерировать заново', en: 'Change one parameter in the prompt and generate again' }, correct: true },
      { text: { ru: 'Переписать промпт полностью на случайный текст', en: 'Rewrite the prompt entirely with random text' }, correct: false },
      { text: { ru: 'Оставить как есть — доработка невозможна', en: "Leave it as is — refinement is impossible" }, correct: false },
    ],
    tryPrompt: {
      ru: 'Логотип для кофейни в стиле минимализм, тёплые тона, плоская векторная графика, без текста, круглая форма',
      en: 'Logo for a coffee shop, minimalist style, warm tones, flat vector graphics, no text, circular shape',
    },
    tryMode: 'image',
  },
  {
    id: 'limits-and-tiers',
    title: { ru: 'Лимиты и тарифы — как расходовать с умом', en: 'Limits and plans — spending them wisely' },
    body: {
      ru: 'Дневной лимит запросов обновляется раз в сутки, а бесплатные видео из наград — конечный ресурс, который не восстанавливается сам. Прежде чем тратить генерацию видео (самую дорогую) — сначала отточите промпт в тексте или картинке, где ошибиться дешевле, а к видео переходите, когда уверены в формулировке.',
      en: "The daily request limit resets once a day, and free videos from rewards are a finite resource that doesn't refill itself. Before spending a video generation (the most expensive one), polish the prompt in text or image mode first, where mistakes are cheap — move to video once you're confident in the wording.",
    },
    quizQuestion: { ru: 'Как разумнее всего использовать лимиты?', en: 'What is the smartest way to use your limits?' },
    quizOptions: [
      { text: { ru: 'Отточить промпт в тексте/фото перед дорогой генерацией видео', en: 'Polish the prompt in text/image before an expensive video generation' }, correct: true },
      { text: { ru: 'Сразу генерировать видео с первой попытки без подготовки', en: 'Generate video right away on the first try with no preparation' }, correct: false },
      { text: { ru: 'Лимиты не важны, генераций всегда бесконечно много', en: "Limits don't matter, generations are always unlimited" }, correct: false },
    ],
  },
  {
    id: 'pricing-work',
    title: { ru: 'Как оценить и продать свою работу', en: 'How to price and sell your work' },
    body: {
      ru: 'Скорость ИИ-генерации не означает, что работа должна стоить копейки — клиент платит за результат и ваше время на подбор промпта, доработку и коммуникацию, а не за секунды генерации. Ориентируйтесь на цены из раздела «Гид», но не бойтесь называть цену чуть выше для первых клиентов — портфолио и отзывы важнее, чем самая низкая цена на рынке.',
      en: "AI generation being fast doesn't mean the work should be priced for pennies — the client pays for the result and your time spent refining the prompt and communicating, not for generation seconds. Use the prices in the Guide tab as a baseline, but don't be afraid to price slightly higher for your first clients — a portfolio and reviews matter more than being the cheapest option on the market.",
    },
    quizQuestion: { ru: 'За что на самом деле платит клиент?', en: 'What is the client actually paying for?' },
    quizOptions: [
      { text: { ru: 'За результат и ваше время на подбор и доработку', en: 'For the result and your time spent refining it' }, correct: true },
      { text: { ru: 'Только за секунды работы модели', en: "Only for the model's generation seconds" }, correct: false },
      { text: { ru: 'Ни за что — работу нужно делать бесплатно', en: "Nothing — the work should be done for free" }, correct: false },
    ],
  },
  {
    id: 'putting-it-together',
    title: { ru: 'От идеи до результата', en: 'From idea to result' },
    body: {
      ru: 'Реальная задача клиента редко решается одним запросом: текст для соцсетей + лого + короткое видео вместе создают целостную подачу. Освоив промптинг во всех трёх режимах, вы готовы применять это на практике — загляните в «Тулкит» за готовыми промптами под конкретные услуги или начните «Марафон», чтобы пройти путь от первого текста до первого объявления за 7 дней.',
      en: "A real client task is rarely solved with a single request: social copy + a logo + a short video together make a complete package. Once you're comfortable prompting in all three modes, you're ready to put it into practice — check the Toolkit for ready-made prompts for specific services, or start the Marathon to go from your first text to your first paid listing in 7 days.",
    },
    quizQuestion: { ru: 'Какой логичный следующий шаг после этого урока?', en: 'What is the logical next step after this lesson?' },
    quizOptions: [
      { text: { ru: 'Применить промптинг на реальной задаче из Тулкита или Марафона', en: 'Apply prompting to a real task from the Toolkit or Marathon' }, correct: true },
      { text: { ru: 'Больше ничего не делать, этого достаточно', en: "Do nothing else, this is enough" }, correct: false },
      { text: { ru: 'Забыть всё и начать заново с нуля', en: 'Forget everything and start over from scratch' }, correct: false },
    ],
    tryPrompt: {
      ru: 'Помоги составить план: как применить ИИ для заработка на основе моих навыков: [опишите свои навыки]',
      en: 'Help me build a plan: how to use AI to earn money based on my skills: [describe your skills]',
    },
    tryMode: 'text',
  },
]
