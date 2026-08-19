import { useState } from 'react'
import axios from 'axios'
import { Download, ImageIcon, Wand2 } from 'lucide-react'
import { api } from '../lib/api'
import { inputClasses, Notice, PageHeader, PrimaryButton, SegmentedTabs } from '../components/ui'
import { track } from '../lib/analytics'
import { haptic } from '../lib/haptics'
import { downloadFile } from '../lib/download'
import { useUserStore } from '../store/userStore'

const MODELS = [
  { id: 'flux', label: 'Flux.1 Pro', endpoint: '/api/image/flux' },
  { id: 'dalle3', label: 'DALL-E 3', endpoint: '/api/image/dalle3' },
] as const

export default function ImagesPage() {
  const userId = useUserStore((s) => s.id)
  const [model, setModel] = useState<(typeof MODELS)[number]>(MODELS[0])
  const [prompt, setPrompt] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [comingSoon, setComingSoon] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([])

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    haptic('light')
    track('image_generate_click', { model: model.id })

    if (!userId) {
      setError('Откройте приложение через Telegram-бота, чтобы отправлять запросы.')
      return
    }

    setPending(true)
    setError(null)
    setComingSoon(null)

    try {
      const res = await api.post(model.endpoint, { user_id: userId, prompt, size: '1024x1024', count: 1 })
      setImages((prev) => [...(res.data.images ?? []), ...prev])
      haptic('success')
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError('Изображения доступны с тарифа Pro — оформите подписку в профиле.')
      } else if (axios.isAxiosError(err) && err.response?.status === 429) {
        setError('Дневной лимит запросов исчерпан. Лимит обновится завтра или повысьте тариф.')
      } else if (axios.isAxiosError(err) && err.response?.status === 501) {
        setComingSoon(err.response.data?.detail ?? 'Эта модель ещё не подключена.')
        haptic('warning')
      } else if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setError(err.response.data.detail)
        haptic('error')
      } else {
        setError('Не удалось отправить запрос. Проверьте, что backend запущен.')
        haptic('error')
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-5 lg:max-w-3xl lg:px-8 lg:py-8">
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
        {comingSoon && <Notice tone="amber">{comingSoon}</Notice>}
        {error && <Notice tone="red">{error}</Notice>}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {images.map((url, i) => (
          <button
            key={url}
            type="button"
            onClick={() => {
              haptic('light')
              downloadFile(url, `zeniteiz-image-${i + 1}.jpg`)
            }}
            className="group relative aspect-square overflow-hidden rounded-2xl border border-gray-200 text-left dark:border-white/10"
          >
            <img src={url} alt={prompt} className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-end justify-end bg-black/0 p-2 opacity-0 transition-opacity group-hover:bg-black/20 group-hover:opacity-100">
              <div className="rounded-lg bg-white/90 p-1.5 dark:bg-black/80">
                <Download size={14} />
              </div>
            </div>
          </button>
        ))}
        {images.length === 0 &&
          Array.from({ length: 4 }).map((_, i) => (
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
