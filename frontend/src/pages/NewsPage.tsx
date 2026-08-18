import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { NewsItem } from '../lib/types'

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    api
      .get<NewsItem[]>('/api/news')
      .then((res) => setNews(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-xl font-semibold">Новости ИИ</h1>

      {loading && <p className="mt-4 text-sm text-gray-500">Загрузка...</p>}
      {error && (
        <p className="mt-4 text-sm text-red-500">
          Не удалось загрузить новости. Убедитесь, что backend запущен на VITE_API_URL.
        </p>
      )}

      <div className="mt-4 space-y-4">
        {news.map((item) => (
          <article key={item.id} className="rounded-xl border border-gray-200 p-4 text-left dark:border-gray-800">
            <h2 className="font-medium">{item.title}</h2>
            <time className="text-xs text-gray-400">
              {new Date(item.published_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
            </time>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{item.content}</p>
            {item.source_url && (
              <a
                href={item.source_url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-xs text-purple-600 dark:text-purple-400"
              >
                Читать источник →
              </a>
            )}
          </article>
        ))}
        {!loading && !error && news.length === 0 && <p className="text-sm text-gray-500">Пока нет новостей.</p>}
      </div>
    </div>
  )
}
