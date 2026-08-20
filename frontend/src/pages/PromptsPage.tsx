import { useEffect, useMemo, useState } from 'react'
import { Check, Copy, Search, SearchX } from 'lucide-react'
import { api } from '../lib/api'
import { CATEGORY_LABELS, type Prompt } from '../lib/types'
import { Card, CardSkeleton, inputClasses, Notice, PageHeader } from '../components/ui'
import { track } from '../lib/analytics'
import { haptic } from '../lib/haptics'
import { useT } from '../lib/i18n'

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const t = useT()

  useEffect(() => {
    api
      .get<Prompt[]>('/api/prompts')
      .then((res) => setPrompts(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => Array.from(new Set(prompts.map((p) => p.category))), [prompts])

  const filtered = prompts.filter((p) => {
    const matchesCategory = !category || p.category === category
    const matchesSearch =
      !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleCopy = async (prompt: Prompt) => {
    await navigator.clipboard.writeText(prompt.prompt_text)
    setCopiedId(prompt.id)
    haptic('success')
    track('prompt_copy', { prompt_id: prompt.id, category: prompt.category })
    setTimeout(() => setCopiedId(null), 1500)
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-5 lg:max-w-3xl lg:px-8 lg:py-8">
      <PageHeader title={t('prompts.title')} />

      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={t('prompts.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputClasses} pl-9`}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => setCategory(null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            category === null
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
          }`}
        >
          {t('prompts.all')}
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              category === c
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
            }`}
          >
            {CATEGORY_LABELS[c] ?? c}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-6">
          <Notice tone="red">{t('prompts.loadError')}</Notice>
        </div>
      )}

      <div className="mt-4 space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        {!loading && filtered.map((prompt) => (
          <Card key={prompt.id} className="text-left">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold">{prompt.title}</h2>
              <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-white/5 dark:text-gray-400">
                {CATEGORY_LABELS[prompt.category] ?? prompt.category}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{prompt.description}</p>
            <button
              onClick={() => handleCopy(prompt)}
              className="mt-3 flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-900 transition-colors hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            >
              {copiedId === prompt.id ? <Check size={13} /> : <Copy size={13} />}
              {copiedId === prompt.id ? t('prompts.copied') : t('prompts.copy')}
            </button>
          </Card>
        ))}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-gray-400 dark:text-gray-600 lg:col-span-2">
            <SearchX size={28} strokeWidth={1.5} />
            <p className="text-sm">{t('prompts.notFound')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
