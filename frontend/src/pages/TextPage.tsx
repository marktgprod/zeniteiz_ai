import { useState } from 'react'
import axios from 'axios'
import { Send } from 'lucide-react'
import { api } from '../lib/api'
import { Card, inputClasses, Notice, PageHeader, PrimaryButton, SegmentedTabs } from '../components/ui'
import { track } from '../lib/analytics'
import { haptic } from '../lib/haptics'

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
    haptic('light')
    track('generate_click', { page: 'text', model: model.id })
    setPending(true)
    setResult(null)
    setComingSoon(false)
    setError(null)

    try {
      const res = await api.post(model.endpoint, { user_id: 'demo', prompt })
      setResult(res.data.text ?? JSON.stringify(res.data))
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
        {comingSoon && (
          <Notice tone="amber">
            Интеграция с {model.label} ещё не подключена — появится после настройки OpenRouter API ключа.
          </Notice>
        )}
        {error && <Notice tone="red">{error}</Notice>}
        {result && <Card className="whitespace-pre-wrap text-left text-sm">{result}</Card>}
      </div>
    </div>
  )
}
