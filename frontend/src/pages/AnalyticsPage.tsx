import { useEffect, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { api } from '../lib/api'
import { Card, CardSkeleton, Notice, PageHeader } from '../components/ui'

interface EventSummary {
  event_name: string
  count: number
  unique_users: number
}

interface RequestStats {
  today: number
  total: number
}

const EVENT_LABELS: Record<string, string> = {
  text_generate_click: 'Запросы на текст',
  image_generate_click: 'Запросы на фото',
  video_generate_click: 'Запросы на видео',
  prompt_copy: 'Копирование промптов',
  upgrade_click: 'Клики на апгрейд тарифа',
  community_link_click: 'Переходы в сообщество',
}

export default function AnalyticsPage() {
  const [events, setEvents] = useState<EventSummary[]>([])
  const [stats, setStats] = useState<RequestStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get<EventSummary[]>('/api/events/summary'),
      api.get<RequestStats>('/api/events/request-stats'),
    ])
      .then(([summaryRes, statsRes]) => {
        setEvents(summaryRes.data.filter((e) => e.event_name in EVENT_LABELS))
        setStats(statsRes.data)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const maxCount = Math.max(1, ...events.map((e) => e.count))

  return (
    <div className="mx-auto max-w-lg px-4 py-5 lg:max-w-3xl lg:px-8 lg:py-8">
      <PageHeader title="Аналитика" />
      <p className="-mt-3 mb-4 text-sm text-gray-500 dark:text-gray-400">
        Видно только вам — сводка по использованию приложения.
      </p>

      {error && <Notice tone="red">Не удалось загрузить аналитику. Убедитесь, что backend запущен.</Notice>}

      <div className="grid grid-cols-2 gap-3">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <Card className="text-left">
              <p className="text-xs text-gray-500 dark:text-gray-400">Запросов сегодня</p>
              <p className="mt-1 text-2xl font-bold">{stats?.today ?? 0}</p>
            </Card>
            <Card className="text-left">
              <p className="text-xs text-gray-500 dark:text-gray-400">Запросов всего</p>
              <p className="mt-1 text-2xl font-bold">{stats?.total ?? 0}</p>
            </Card>
          </>
        )}
      </div>
      <p className="mt-2 text-xs text-gray-400">
        Запрос = клик «Сгенерировать» на Текст/Фото/Видео. Пока не подключены ключи ИИ-провайдеров, это спрос, а не
        готовые результаты.
      </p>

      <h2 className="mt-6 mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">По типам событий</h2>
      <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
        {loading && Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}

        {!loading &&
          events.map((e) => (
            <Card key={e.event_name} className="text-left">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-semibold">{EVENT_LABELS[e.event_name] ?? e.event_name}</h2>
                <span className="shrink-0 text-sm text-gray-500 dark:text-gray-400">{e.count}</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-black dark:bg-white"
                  style={{ width: `${(e.count / maxCount) * 100}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-400">{e.unique_users} уникальных пользователей</p>
            </Card>
          ))}

        {!loading && !error && events.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-gray-400 dark:text-gray-600 lg:col-span-2">
            <BarChart3 size={28} strokeWidth={1.5} />
            <p className="text-sm">Пока нет данных</p>
          </div>
        )}
      </div>
    </div>
  )
}
