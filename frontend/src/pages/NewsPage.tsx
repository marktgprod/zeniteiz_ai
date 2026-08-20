import { useEffect, useState } from 'react'
import { ExternalLink, Inbox, Newspaper } from 'lucide-react'
import { api } from '../lib/api'
import type { NewsItem } from '../lib/types'
import { Card, CardSkeleton, Notice, PageHeader } from '../components/ui'
import { useT } from '../lib/i18n'
import { useUserStore } from '../store/userStore'

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const t = useT()
  const language = useUserStore((s) => s.language)

  useEffect(() => {
    api
      .get<NewsItem[]>('/api/news')
      .then((res) => setNews(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-lg px-4 py-5 lg:max-w-3xl lg:px-8 lg:py-8">
      <PageHeader title={t('news.title')} />

      {error && <Notice tone="red">{t('news.loadError')}</Notice>}

      <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
        {loading && Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}

        {!loading &&
          news.map((item) => {
            const title = language === 'en' ? item.title_en ?? item.title : item.title
            const content = language === 'en' ? item.content_en ?? item.content : item.content
            return (
            <Card key={item.id} className="text-left">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white">
                  <Newspaper size={15} />
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold">{title}</h2>
                  <time className="text-xs text-gray-400">
                    {new Date(item.published_at).toLocaleDateString(language === 'en' ? 'en-US' : 'ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </time>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{content}</p>
              {item.source_url && (
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gray-900 underline underline-offset-2 hover:opacity-70 dark:text-white"
                >
                  {t('news.readSource')} <ExternalLink size={11} />
                </a>
              )}
            </Card>
            )
          })}

        {!loading && !error && news.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-gray-400 dark:text-gray-600 lg:col-span-2">
            <Inbox size={28} strokeWidth={1.5} />
            <p className="text-sm">{t('news.empty')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
