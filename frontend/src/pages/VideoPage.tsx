import { useState } from 'react'
import { Clapperboard, Download } from 'lucide-react'
import { inputClasses, Notice, PageHeader, PrimaryButton } from '../components/ui'
import { track } from '../lib/analytics'
import { haptic } from '../lib/haptics'
import { useUserStore } from '../store/userStore'
import { useVideoStore } from '../store/videoStore'

export default function VideoPage() {
  const userId = useUserStore((s) => s.id)
  const { status, videoUrl, error, start } = useVideoStore()
  const [prompt, setPrompt] = useState('')

  const pending = status === 'pending'

  const handleGenerate = () => {
    if (!prompt.trim()) return
    haptic('light')
    track('video_generate_click', { model: 'minimax' })

    if (!userId) {
      useVideoStore.setState({ status: 'error', error: 'Откройте приложение через Telegram-бота, чтобы отправлять запросы.' })
      return
    }

    start(userId, prompt)
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

      {pending && (
        <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
          Можно перейти на другую вкладку — генерация продолжится в фоне.
        </p>
      )}

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
