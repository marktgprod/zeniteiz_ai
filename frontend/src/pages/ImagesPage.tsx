import { useState } from 'react'
import { Download, ImageIcon, Wand2 } from 'lucide-react'
import { inputClasses, Notice, PageHeader, PrimaryButton, SegmentedTabs } from '../components/ui'
import { track } from '../lib/analytics'
import { haptic } from '../lib/haptics'
import { downloadFile } from '../lib/download'
import { useT } from '../lib/i18n'
import { useUserStore } from '../store/userStore'
import { IMAGE_MODELS, useImagesStore } from '../store/imagesStore'

export default function ImagesPage() {
  const userId = useUserStore((s) => s.id)
  const { model, images, pending, error, comingSoon, setModel, generate } = useImagesStore()
  const [prompt, setPrompt] = useState('')
  const t = useT()

  const handleGenerate = () => {
    if (!prompt.trim()) return
    haptic('light')
    track('image_generate_click', { model })

    if (!userId) {
      useImagesStore.setState({ error: t('error.openViaBot') })
      return
    }

    generate(userId, prompt)
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-5 lg:max-w-3xl lg:px-8 lg:py-8">
      <PageHeader title={t('images.title')} />

      {IMAGE_MODELS.length > 1 && (
        <SegmentedTabs
          options={IMAGE_MODELS.map((m) => ({ id: m.id, label: m.label }))}
          value={model}
          onChange={(id) => setModel(id)}
        />
      )}

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={t('images.placeholder')}
        rows={3}
        className={`mt-3 ${inputClasses}`}
      />

      <PrimaryButton
        onClick={handleGenerate}
        disabled={pending || !prompt.trim()}
        className="mt-3 flex w-full items-center justify-center gap-2"
      >
        <Wand2 size={15} />
        {pending ? t('images.generating') : t('images.generate')}
      </PrimaryButton>

      {pending && (
        <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">{t('images.backgroundHint')}</p>
      )}

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
