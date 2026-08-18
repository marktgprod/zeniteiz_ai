import { useState } from 'react'
import axios from 'axios'
import { ImageIcon, Wand2 } from 'lucide-react'
import { api } from '../lib/api'
import { inputClasses, Notice, PageHeader, PrimaryButton, SegmentedTabs } from '../components/ui'

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
    <div className="mx-auto max-w-lg px-4 py-5">
      <PageHeader title="Изображения" />

      <SegmentedTabs
        options={MODELS.map((m) => ({ id: m.id, label: m.label }))}
        value={model.id}
        onChange={(id) => setModel(MODELS.find((m) => m.id === id)!)}
      />

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Опишите изображение..."
        rows={3}
        className={`mt-3 ${inputClasses}`}
      />

      <PrimaryButton
        onClick={handleGenerate}
        disabled={pending || !prompt.trim()}
        className="mt-3 flex w-full items-center justify-center gap-2"
      >
        <Wand2 size={15} />
        {pending ? 'Генерация...' : 'Сгенерировать'}
      </PrimaryButton>

      <div className="mt-4 space-y-3">
        {comingSoon && (
          <Notice tone="amber">
            Интеграция с {model.label} ещё не подключена — появится после настройки API ключа.
          </Notice>
        )}
        {error && <Notice tone="red">{error}</Notice>}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-gray-200 text-gray-300 dark:border-white/10 dark:text-gray-700"
          >
            <ImageIcon size={22} strokeWidth={1.5} />
          </div>
        ))}
      </div>
    </div>
  )
}
