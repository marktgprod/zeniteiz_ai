import { useEffect, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { api } from '../lib/api'
import { Card, CardSkeleton, Notice, PageHeader } from '../components/ui'

interface EventSummary {
  event_name: string
  count: number
  unique_users: number
}

const EVENT_LABELS: Record<string, string> = {
  page_view: 'Просмотры разделов',
  prompt_copy: 'Копирование промптов',
  generate_click: 'Клики «Сгенерировать»',
  upgrade_click: 'Клики на апгрейд тарифа',
  community_link_click: 'Переходы в сообщество',
}

export default function AnalyticsPage() {
  const [events, setEvents] = useState<EventSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    api
      .get<EventSummary[]>('/api/events/summary')
      .then((res) => setEvents(res.data))
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
