import { useEffect, useRef, useState } from 'react'
import { Paperclip, Send, Trash2, X } from 'lucide-react'
import { Notice, PageHeader, SegmentedTabs } from '../components/ui'
import { track } from '../lib/analytics'
import { haptic } from '../lib/haptics'
import { fileToCompressedDataUrl } from '../lib/image'
import { useT } from '../lib/i18n'
import { useUserStore } from '../store/userStore'
import { TEXT_MODELS, useChatStore } from '../store/chatStore'

const MAX_IMAGES = 4

export default function TextPage() {
  const userId = useUserStore((s) => s.id)
  const { model, messages, pending, error, setModel, send, clear } = useChatStore()
  const [prompt, setPrompt] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const t = useT()

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, pending])

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploadError(null)
    const slice = Array.from(files).slice(0, MAX_IMAGES - images.length)
    try {
      const compressed = await Promise.all(slice.map((f) => fileToCompressedDataUrl(f)))
      setImages((prev) => [...prev, ...compressed].slice(0, MAX_IMAGES))
    } catch {
      setUploadError(t('text.imageUploadError'))
    }
  }

  const handleSend = () => {
    const text = prompt.trim()
    if (!text) return
    haptic('light')
    track('text_generate_click', { model })

    if (!userId) {
      useChatStore.setState({ error: t('error.openViaBot') })
      return
    }

    setPrompt('')
    const toSend = images
    setImages([])
    send(userId, text, toSend.length > 0 ? toSend : undefined)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col px-4 py-5 lg:max-w-3xl lg:px-8 lg:py-8">
      <div className="flex items-center justify-between">
        <PageHeader title={t('text.title')} />
        {messages.length > 0 && (
          <button
            onClick={() => {
              haptic('light')
              clear()
            }}
            className="mb-4 flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200"
          >
            <Trash2 size={13} />
            {t('text.clear')}
          </button>
        )}
      </div>

      <SegmentedTabs
        options={TEXT_MODELS.map((m) => ({ id: m.id, label: m.label }))}
        value={model}
        onChange={(id) => setModel(id)}
      />

      <div
        ref={scrollRef}
        className="mt-3 flex-1 space-y-3 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50/50 p-3 dark:border-white/5 dark:bg-white/[0.02]"
        style={{ minHeight: '45vh', maxHeight: '60vh' }}
      >
        {messages.length === 0 && !pending && (
          <p className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-400 dark:text-gray-500">
            {t('text.placeholder')}
          </p>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm ${
                m.role === 'user'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'border border-gray-200 bg-white text-gray-900 dark:border-white/10 dark:bg-white/[0.05] dark:text-gray-100'
              }`}
            >
              {m.images && m.images.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {m.images.map((img, j) => (
                    <img
                      key={j}
                      src={img}
                      alt=""
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}
              {m.content}
            </div>
          </div>
        ))}

        {pending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 dark:border-white/10 dark:bg-white/[0.05]">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s] dark:bg-gray-500" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s] dark:bg-gray-500" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500" />
            </div>
          </div>
        )}
      </div>

      {pending && (
        <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">{t('text.backgroundHint')}</p>
      )}

      {error && (
        <div className="mt-3">
          <Notice tone="red">{error}</Notice>
        </div>
      )}

      {uploadError && (
        <div className="mt-3">
          <Notice tone="red">{uploadError}</Notice>
        </div>
      )}

      {images.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative h-16 w-16 shrink-0">
              <img src={img} alt="" className="h-full w-full rounded-lg object-cover" />
              <button
                onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                aria-label={t('text.removeImage')}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black text-white shadow-sm dark:bg-white dark:text-black"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <button
          onClick={() => {
            haptic('light')
            fileInputRef.current?.click()
          }}
          disabled={images.length >= MAX_IMAGES}
          aria-label={t('text.attachImage')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/[0.05]"
        >
          <Paperclip size={16} />
        </button>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('text.inputPlaceholder')}
          rows={1}
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-white/10 dark:bg-white/[0.03] dark:placeholder:text-gray-500 dark:focus:border-white dark:focus:ring-white/10"
        />
        <button
          onClick={handleSend}
          disabled={pending || !prompt.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white shadow-sm transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
