import { useState } from 'react'
import axios from 'axios'
import { api } from '../lib/api'

export default function VideoPage() {
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState(5)
  const [pending, setPending] = useState(false)
  const [comingSoon, setComingSoon] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setPending(true)
    setComingSoon(false)
    setError(null)

    try {
      await api.post('/api/video/runway', { user_id: 'demo', prompt, duration_seconds: duration })
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
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">Видео</h1>
        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">
          VIP
        </span>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Опишите сцену или сюжет..."
        rows={3}
        className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
      />

      <label className="mt-3 block text-sm text-gray-500 dark:text-gray-400">
        Длительность: {duration}с
        <input
          type="range"
          min={5}
          max={30}
          step={5}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="mt-1 w-full"
        />
      </label>

      <button
        onClick={handleGenerate}
        disabled={pending || !prompt.trim()}
        className="mt-3 w-full rounded-lg bg-purple-600 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? 'Генерация...' : 'Сгенерировать видео'}
      </button>

      {comingSoon && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          Интеграция с Runway Gen-3 ещё не подключена — появится после настройки FAL.AI ключа.
        </p>
      )}
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
    </div>
  )
}
