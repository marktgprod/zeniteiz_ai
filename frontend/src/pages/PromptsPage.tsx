import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { CATEGORY_LABELS, type Prompt } from '../lib/types'

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
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-xl font-semibold">Промпты</h1>

      <input
        type="text"
        placeholder="Поиск по промптам..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => setCategory(null)}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            category === null ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          Все
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              category === c ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {CATEGORY_LABELS[c] ?? c}
          </button>
        ))}
      </div>

      {loading && <p className="mt-6 text-sm text-gray-500">Загрузка...</p>}
      {error && (
        <p className="mt-6 text-sm text-red-500">
          Не удалось загрузить промпты. Убедитесь, что backend запущен на VITE_API_URL.
        </p>
      )}

      <div className="mt-4 space-y-3">
        {filtered.map((prompt) => (
          <div key={prompt.id} className="rounded-xl border border-gray-200 p-4 text-left dark:border-gray-800">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-medium">{prompt.title}</h2>
              <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800">
                {CATEGORY_LABELS[prompt.category] ?? prompt.category}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{prompt.description}</p>
            <button
              onClick={() => handleCopy(prompt)}
              className="mt-3 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700"
            >
              {copiedId === prompt.id ? 'Скопировано ✓' : 'Скопировать промпт'}
            </button>
          </div>
        ))}
        {!loading && !error && filtered.length === 0 && (
          <p className="text-sm text-gray-500">Ничего не найдено.</p>
        )}
      </div>
    </div>
  )
}
