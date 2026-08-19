import { create } from 'zustand'
import axios from 'axios'
import { api } from '../lib/api'
import { haptic } from '../lib/haptics'

export const TEXT_MODELS = [
  { id: 'claude', label: 'Claude Sonnet 5', endpoint: '/api/text/claude' },
  { id: 'gpt4o', label: 'GPT-4o mini', endpoint: '/api/text/gpt4o' },
] as const

export type TextModelId = (typeof TEXT_MODELS)[number]['id']
export type ChatMessage = { role: 'user' | 'assistant'; content: string }

interface ChatState {
  model: TextModelId
  messages: ChatMessage[]
  pending: boolean
  error: string | null
  setModel: (id: TextModelId) => void
  send: (userId: string, prompt: string) => Promise<void>
  clear: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  model: 'claude',
  messages: [],
  pending: false,
  error: null,

  setModel: (id) => set({ model: id }),

  send: async (userId, prompt) => {
    const model = TEXT_MODELS.find((m) => m.id === get().model)!
    const history = get().messages
    set({ messages: [...history, { role: 'user', content: prompt }], pending: true, error: null })

    try {
      const res = await api.post(model.endpoint, { user_id: userId, prompt, history })
      const reply = res.data.text ?? JSON.stringify(res.data)
      set((s) => ({ messages: [...s.messages, { role: 'assistant', content: reply }], pending: false }))
      haptic('success')
    } catch (err) {
      let error = 'Не удалось отправить запрос. Проверьте, что backend запущен.'
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        error = 'Текст доступен с тарифа Starter — оформите подписку в профиле.'
      } else if (axios.isAxiosError(err) && err.response?.status === 429) {
        error = 'Дневной лимит запросов исчерпан. Лимит обновится завтра или повысьте тариф.'
      } else if (axios.isAxiosError(err) && err.response?.data?.detail) {
        error = err.response.data.detail
      }
      set((s) => ({ messages: s.messages.slice(0, -1), pending: false, error }))
      haptic('error')
    }
  },

  clear: () => set({ messages: [], error: null }),
}))
