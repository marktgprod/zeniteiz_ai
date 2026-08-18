import { useState } from 'react'
import axios from 'axios'
import { Clapperboard } from 'lucide-react'
import { api } from '../lib/api'
import { inputClasses, Notice, PageHeader, PrimaryButton } from '../components/ui'
import { track } from '../lib/analytics'
import { haptic } from '../lib/haptics'

export default function VideoPage() {
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState(5)
  const [pending, setPending] = useState(false)
  const [comingSoon, setComingSoon] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    haptic('light')
    track('generate_click', { page: 'video', model: 'runway', duration_seconds: duration })
    setPending(true)
    setComingSoon(false)
    setError(null)

    try {
      await api.post('/api/video/runway', { user_id: 'demo', prompt, duration_seconds: duration })
      haptic('success')
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 501) {
        setComingSoon(true)
        haptic('warning')
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
      <PageHeader
        title="Видео"
        badge={
          <span className="rounded-full bg-black px-2.5 py-0.5 text-[11px] font-semibold text-white dark:bg-white dark:text-black">
            VIP
          </span>
        }
      />

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Опишите сцену или сюжет..."
        rows={3}
        className={inputClasses}
      />

      <label className="mt-4 block text-sm text-gray-500 dark:text-gray-400">
        Длительность: <span className="font-medium text-gray-900 dark:text-gray-100">{duration}с</span>
        <input
          type="range"
          min={5}
          max={30}
          step={5}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="mt-2 w-full accent-black dark:accent-white"
        />
      </label>

      <PrimaryButton
        onClick={handleGenerate}
        disabled={pending || !prompt.trim()}
        className="mt-4 flex w-full items-center justify-center gap-2"
      >
        <Clapperboard size={15} />
        {pending ? 'Генерация...' : 'Сгенерировать видео'}
      </PrimaryButton>

      <div className="mt-4 space-y-3">
        {comingSoon && (
          <Notice tone="amber">
            Интеграция с Runway Gen-3 ещё не подключена — появится после настройки FAL.AI ключа.
          </Notice>
        )}
        {error && <Notice tone="red">{error}</Notice>}
      </div>
    </div>
  )
}
