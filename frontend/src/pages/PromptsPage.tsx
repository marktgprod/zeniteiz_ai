import { useEffect, useMemo, useState } from 'react'
import { Check, Copy, Search, SearchX } from 'lucide-react'
import { api } from '../lib/api'
import { CATEGORY_LABELS, type Prompt } from '../lib/types'
import { Card, inputClasses, Notice, PageHeader } from '../components/ui'

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

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
    setTimeout(() => setCopiedId(null), 1500)
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-5">
      <PageHeader title="Промпты" />

      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Поиск по промптам..."
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
          Все
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

      {loading && <p className="mt-6 text-sm text-gray-500">Загрузка...</p>}
      {error && (
        <div className="mt-6">
          <Notice tone="red">Не удалось загрузить промпты. Убедитесь, что backend запущен на VITE_API_URL.</Notice>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {filtered.map((prompt) => (
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
              {copiedId === prompt.id ? 'Скопировано' : 'Скопировать промпт'}
            </button>
          </Card>
        ))}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-gray-400 dark:text-gray-600">
            <SearchX size={28} strokeWidth={1.5} />
            <p className="text-sm">Ничего не найдено</p>
          </div>
        )}
      </div>
    </div>
  )
}
