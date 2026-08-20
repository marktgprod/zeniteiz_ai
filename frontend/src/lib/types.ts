export interface Prompt {
  id: string
  title: string
  description: string
  category: string
  prompt_text: string
  model_type: 'text' | 'image' | 'video'
  rating: number
}

export interface NewsItem {
  id: string
  title: string
  summary: string
  content: string
  title_en: string | null
  summary_en: string | null
  content_en: string | null
  source_url: string | null
  published_at: string
}

