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
  source_url: string | null
  published_at: string
}

