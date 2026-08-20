import { useState } from 'react'
import { Clapperboard, Download } from 'lucide-react'
import { inputClasses, Notice, PrimaryButton } from '../components/ui'
import { track } from '../lib/analytics'
import { haptic } from '../lib/haptics'
import { downloadFile } from '../lib/download'
import { useT } from '../lib/i18n'
import { useUserStore } from '../store/userStore'
import { useVideoStore } from '../store/videoStore'

export default function VideoPage({ initialPrompt }: { initialPrompt?: string }) {
  const userId = useUserStore((s) => s.id)
  const { status, videoUrl, error, start } = useVideoStore()
  const [prompt, setPrompt] = useState(initialPrompt ?? '')
  const t = useT()

  const pending = status === 'pending'

  const handleGenerate = () => {
    if (!prompt.trim()) return
    haptic('light')
    track('video_generate_click', { model: 'minimax' })

    if (!userId) {
      useVideoStore.setState({ status: 'error', error: t('error.openViaBot') })
      return
    }

    start(userId, prompt)
  }

  return (
    <div>
      <span className="mb-3 inline-block rounded-full bg-black px-2.5 py-0.5 text-[11px] font-semibold text-white dark:bg-white dark:text-black">
        VIP
      </span>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={t('video.placeholder')}
        rows={3}
        className={inputClasses}
      />

      <PrimaryButton
        onClick={handleGenerate}
        disabled={pending || !prompt.trim()}
        className="mt-4 flex w-full items-center justify-center gap-2"
      >
        <Clapperboard size={15} />
        {pending ? t('video.generating') : t('video.generate')}
      </PrimaryButton>

      {pending && (
        <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">{t('video.backgroundHint')}</p>
      )}

      <div className="mt-4 space-y-3">{error && <Notice tone="red">{error}</Notice>}</div>

      {videoUrl && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
          <video src={videoUrl} controls autoPlay loop className="w-full" />
          <button
            type="button"
            onClick={() => {
              haptic('light')
              downloadFile(videoUrl, 'zeniteiz-video.mp4')
            }}
            className="flex w-full items-center justify-center gap-2 border-t border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 dark:border-white/10 dark:text-gray-300 dark:hover:text-white"
          >
            <Download size={14} />
            {t('video.download')}
          </button>
        </div>
      )}
    </div>
  )
}
