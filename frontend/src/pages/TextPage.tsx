import { useState } from 'react'
import axios from 'axios'
import { Send } from 'lucide-react'
import { api } from '../lib/api'
import { Card, inputClasses, Notice, PageHeader, PrimaryButton, SegmentedTabs } from '../components/ui'
import { track } from '../lib/analytics'
import { haptic } from '../lib/haptics'
import { useUserStore } from '../store/userStore'

const MODELS = [
  { id: 'claude', label: 'Claude Sonnet 5', endpoint: '/api/text/claude' },
  { id: 'gpt4o', label: 'GPT-4o mini', endpoint: '/api/text/gpt4o' },
] as const

export default function TextPage() {
  const userId = useUserStore((s) => s.id)
  const [model, setModel] = useState<(typeof MODELS)[number]>(MODELS[0])
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async () => {
    if (!prompt.trim()) return
    haptic('light')
    track('text_generate_click', { model: model.id })

    if (!userId) {
      setError('Откройте приложение через Telegram-бота, чтобы отправлять запросы.')
      return
    }

    setPending(true)
    setResult(null)
    setError(null)

    try {
      const res = await api.post(model.endpoint, { user_id: userId, prompt })
      setResult(res.data.text ?? JSON.stringify(res.data))
      haptic('success')
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError('Текст доступен с тарифа Starter — оформите подписку в профиле.')
      } else if (axios.isAxiosError(err) && err.response?.status === 429) {
        setError('Дневной лимит запросов исчерпан. Лимит обновится завтра или повысьте тариф.')
      } else if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else {
        setError('Не удалось отправить запрос. Проверьте, что backend запущен.')
      }
      haptic('error')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-5 lg:max-w-3xl lg:px-8 lg:py-8">
      <PageHeader title="Текст и рассуждение" />

      <SegmentedTabs
        options={MODELS.map((m) => ({ id: m.id, label: m.label }))}
        value={model.id}
        onChange={(id) => setModel(MODELS.find((m) => m.id === id)!)}
      />

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Напишите запрос..."
        rows={5}
        className={`mt-3 ${inputClasses}`}
      />

      <PrimaryButton onClick={handleSend} disabled={pending || !prompt.trim()} className="mt-3 flex w-full items-center justify-center gap-2">
        <Send size={15} />
        {pending ? 'Отправка...' : 'Отправить'}
      </PrimaryButton>

      <div className="mt-4 space-y-3">
        {error && <Notice tone="red">{error}</Notice>}
        {result && <Card className="whitespace-pre-wrap text-left text-sm">{result}</Card>}
      </div>
    </div>
  )
}
