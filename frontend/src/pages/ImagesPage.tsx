import { useState } from 'react'
import axios from 'axios'
import { api } from '../lib/api'

const MODELS = [
  { id: 'flux', label: 'Flux.1 Pro', endpoint: '/api/image/flux' },
  { id: 'dalle3', label: 'DALL-E 3', endpoint: '/api/image/dalle3' },
] as const

export default function ImagesPage() {
  const [model, setModel] = useState<(typeof MODELS)[number]>(MODELS[0])
  const [prompt, setPrompt] = useState('')
  const [pending, setPending] = useState(false)
  const [comingSoon, setComingSoon] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setPending(true)
    setComingSoon(false)
    setError(null)

    try {
      await api.post(model.endpoint, { user_id: 'demo', prompt, size: '1024x1024', count: 1 })
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 501) {
        setComingSoon(true)
      } else {
        setError('Не удалось отправить запрос. Проверьте, что backend запущен.')
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-xl font-semibold">Изображения</h1>

      <div className="mt-3 flex gap-2">
        {MODELS.map((m) => (
          <button
            key={m.id}
            onClick={() => setModel(m)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              model.id === m.id ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Опишите изображение..."
        rows={3}
        className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
      />

      <button
        onClick={handleGenerate}
        disabled={pending || !prompt.trim()}
        className="mt-3 w-full rounded-lg bg-purple-600 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? 'Генерация...' : 'Сгенерировать'}
      </button>

      {comingSoon && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          Интеграция с {model.label} ещё не подключена — появится после настройки API ключа.
        </p>
      )}
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      <div className="mt-6 grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex aspect-square items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400 dark:bg-gray-900"
          >
            Пусто
          </div>
        ))}
      </div>
    </div>
  )
}
