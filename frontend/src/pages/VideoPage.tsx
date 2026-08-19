import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Clapperboard, Download } from 'lucide-react'
import { api } from '../lib/api'
import { inputClasses, Notice, PageHeader, PrimaryButton } from '../components/ui'
import { track } from '../lib/analytics'
import { haptic } from '../lib/haptics'
import { useUserStore } from '../store/userStore'

const POLL_INTERVAL_MS = 4000

export default function VideoPage() {
  const userId = useUserStore((s) => s.id)
  const [prompt, setPrompt] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const pollRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (pollRef.current) window.clearTimeout(pollRef.current)
    },
    [],
  )

  const pollStatus = (requestId: string) => {
    pollRef.current = window.setTimeout(async () => {
      try {
        const res = await api.get(`/api/video/status/${requestId}`)
        if (res.data.status === 'completed') {
          setVideoUrl(res.data.video_url)
          setPending(false)
          haptic('success')
        } else {
          pollStatus(requestId)
        }
      } catch (err) {
        setPending(false)
        setError(
          axios.isAxiosError(err) && err.response?.data?.detail
            ? err.response.data.detail
            : 'Не удалось получить статус генерации.',
        )
        haptic('error')
      }
    }, POLL_INTERVAL_MS)
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    haptic('light')
    track('video_generate_click', { model: 'minimax' })

    if (!userId) {
      setError('Откройте приложение через Telegram-бота, чтобы отправлять запросы.')
      return
    }

    setPending(true)
    setError(null)
    setVideoUrl(null)

    try {
      const res = await api.post('/api/video/runway', { user_id: userId, prompt })
      pollStatus(res.data.request_id)
    } catch (err) {
      setPending(false)
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError('Видео доступно только на тарифе VIP — оформите подписку в профиле.')
      } else if (axios.isAxiosError(err) && err.response?.status === 429) {
        setError('Дневной лимит запросов исчерпан. Лимит обновится завтра.')
      } else if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else {
        setError('Не удалось отправить запрос. Проверьте, что backend запущен.')
      }
      haptic('error')
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

      <PrimaryButton
        onClick={handleGenerate}
        disabled={pending || !prompt.trim()}
        className="mt-4 flex w-full items-center justify-center gap-2"
      >
        <Clapperboard size={15} />
        {pending ? 'Генерация... (обычно 1-2 минуты)' : 'Сгенерировать видео'}
      </PrimaryButton>

      <div className="mt-4 space-y-3">{error && <Notice tone="red">{error}</Notice>}</div>

      {videoUrl && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
          <video src={videoUrl} controls autoPlay loop className="w-full" />
          <a
            href={videoUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 border-t border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 dark:border-white/10 dark:text-gray-300 dark:hover:text-white"
          >
            <Download size={14} />
            Скачать видео
          </a>
        </div>
      )}
    </div>
  )
}
