import { useState } from 'react'
import axios from 'axios'
import { api } from '../lib/api'

const MODELS = [
  { id: 'claude', label: 'Claude Sonnet 5', endpoint: '/api/text/claude' },
  { id: 'gpt4o', label: 'GPT-4o mini', endpoint: '/api/text/gpt4o' },
] as const

export default function TextPage() {
  const [model, setModel] = useState<(typeof MODELS)[number]>(MODELS[0])
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [comingSoon, setComingSoon] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async () => {
    if (!prompt.trim()) return
    setPending(true)
    setResult(null)
    setComingSoon(false)
    setError(null)

    try {
      const res = await api.post(model.endpoint, { user_id: 'demo', prompt })
      setResult(res.data.text ?? JSON.stringify(res.data))
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
      <h1 className="text-xl font-semibold">Текст и рассуждение</h1>

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
        placeholder="Напишите запрос..."
        rows={5}
        className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
      />

      <button
        onClick={handleSend}
        disabled={pending || !prompt.trim()}
        className="mt-3 w-full rounded-lg bg-purple-600 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? 'Отправка...' : 'Отправить'}
      </button>

      {comingSoon && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          Интеграция с {model.label} ещё не подключена — появится после настройки OpenRouter API ключа.
        </p>
      )}
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      {result && (
        <div className="mt-4 whitespace-pre-wrap rounded-lg border border-gray-200 p-3 text-left text-sm dark:border-gray-800">
          {result}
        </div>
      )}
    </div>
  )
}
