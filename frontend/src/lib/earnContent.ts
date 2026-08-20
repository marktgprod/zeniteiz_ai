import type { Language } from '../store/userStore'

export type EarnMode = 'text' | 'image'

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
    mode: 'image',
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
