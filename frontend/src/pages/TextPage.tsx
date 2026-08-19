import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Send, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { Notice, PageHeader, SegmentedTabs } from '../components/ui'
import { track } from '../lib/analytics'
import { haptic } from '../lib/haptics'
import { useUserStore } from '../store/userStore'

const MODELS = [
  { id: 'claude', label: 'Claude Sonnet 5', endpoint: '/api/text/claude' },
  { id: 'gpt4o', label: 'GPT-4o mini', endpoint: '/api/text/gpt4o' },
] as const

type ChatMessage = { role: 'user' | 'assistant'; content: string }

export default function TextPage() {
  const userId = useUserStore((s) => s.id)
  const [model, setModel] = useState<(typeof MODELS)[number]>(MODELS[0])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [prompt, setPrompt] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, pending])

  const handleSend = async () => {
    const text = prompt.trim()
    if (!text) return
    haptic('light')
    track('text_generate_click', { model: model.id })

    if (!userId) {
      setError('Откройте приложение через Telegram-бота, чтобы отправлять запросы.')
      return
    }

    const history = messages
    setMessages([...history, { role: 'user', content: text }])
    setPrompt('')
    setPending(true)
    setError(null)

    try {
      const res = await api.post(model.endpoint, { user_id: userId, prompt: text, history })
      const reply = res.data.text ?? JSON.stringify(res.data)
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
      haptic('success')
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError('Текст доступен с тарифа Starter — оформите подписку в профиле.')
      } else if (axios.isAxiosError(err) && err.response?.status === 429) {
        setError('Дневной лимит запросов исчерпан. Лимит обновится завтра или повысьте тариф.')
      } else if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else {
        setError('Не удалось отправить запрос. Проверьте, что backend запущен.')
      }
      setMessages((prev) => prev.slice(0, -1))
      setPrompt(text)
      haptic('error')
    } finally {
      setPending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col px-4 py-5 lg:max-w-3xl lg:px-8 lg:py-8">
      <div className="flex items-center justify-between">
        <PageHeader title="Текст и рассуждение" />
        {messages.length > 0 && (
          <button
            onClick={() => {
              haptic('light')
              setMessages([])
              setError(null)
            }}
            className="mb-4 flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200"
          >
            <Trash2 size={13} />
            Очистить
          </button>
        )}
      </div>

      <SegmentedTabs
        options={MODELS.map((m) => ({ id: m.id, label: m.label }))}
        value={model.id}
        onChange={(id) => setModel(MODELS.find((m) => m.id === id)!)}
      />

      <div
        ref={scrollRef}
        className="mt-3 flex-1 space-y-3 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50/50 p-3 dark:border-white/5 dark:bg-white/[0.02]"
        style={{ minHeight: '45vh', maxHeight: '60vh' }}
      >
        {messages.length === 0 && !pending && (
          <p className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-400 dark:text-gray-500">
            Задайте вопрос — весь диалог сохранится здесь, пока вы не очистите чат.
          </p>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm ${
                m.role === 'user'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'border border-gray-200 bg-white text-gray-900 dark:border-white/10 dark:bg-white/[0.05] dark:text-gray-100'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {pending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 dark:border-white/10 dark:bg-white/[0.05]">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s] dark:bg-gray-500" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s] dark:bg-gray-500" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500" />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3">
          <Notice tone="red">{error}</Notice>
        </div>
      )}

      <div className="mt-3 flex items-end gap-2">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Напишите сообщение..."
          rows={1}
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-white/10 dark:bg-white/[0.03] dark:placeholder:text-gray-500 dark:focus:border-white dark:focus:ring-white/10"
        />
        <button
          onClick={handleSend}
          disabled={pending || !prompt.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white shadow-sm transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
