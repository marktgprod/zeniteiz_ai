import { useEffect, useState } from 'react'
import { ExternalLink, Newspaper } from 'lucide-react'
import { api } from '../lib/api'
import type { NewsItem } from '../lib/types'
import { Card, Notice, PageHeader } from '../components/ui'

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
    <div className="mx-auto max-w-lg px-4 py-5">
      <PageHeader title="Новости ИИ" />

      {loading && <p className="text-sm text-gray-500">Загрузка...</p>}
      {error && <Notice tone="red">Не удалось загрузить новости. Убедитесь, что backend запущен на VITE_API_URL.</Notice>}

      <div className="space-y-3">
        {news.map((item) => (
          <Card key={item.id} className="text-left">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white">
                <Newspaper size={15} />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold">{item.title}</h2>
                <time className="text-xs text-gray-400">
                  {new Date(item.published_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </time>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{item.content}</p>
            {item.source_url && (
              <a
                href={item.source_url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gray-900 underline underline-offset-2 hover:opacity-70 dark:text-white"
              >
                Читать источник <ExternalLink size={11} />
              </a>
            )}
          </Card>
        ))}
        {!loading && !error && news.length === 0 && <p className="text-sm text-gray-500">Пока нет новостей.</p>}
      </div>
    </div>
  )
}
