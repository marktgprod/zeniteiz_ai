import { useEffect, useState } from 'react'
import { Crown } from 'lucide-react'
import { api } from '../lib/api'
import { Card, PageHeader, SegmentedTabs, Skeleton } from '../components/ui'
import { useT } from '../lib/i18n'
import { useUserStore } from '../store/userStore'

type Kind = 'referrals' | 'activity'

interface Entry {
  rank: number
  name: string | null
  value: number
  is_you: boolean
}

interface LeaderboardData {
  entries: Entry[]
  my_rank: number | null
  my_value: number
}

const RANK_STYLES: Record<number, string> = {
  1: 'bg-amber-400 text-black',
  2: 'bg-gray-300 text-black',
  3: 'bg-amber-700 text-white',
}

export default function LeaderboardPage() {
  const [kind, setKind] = useState<Kind>('referrals')
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const userId = useUserStore((s) => s.id)
  const t = useT()

  useEffect(() => {
    setLoading(true)
    api
      .get<LeaderboardData>(`/api/leaderboard/${kind}`, { params: userId ? { user_id: userId } : {} })
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [kind, userId])

  const valueLabel = kind === 'referrals' ? t('leaderboard.referralsUnit') : t('leaderboard.activityUnit')
  const showMyRank = data?.my_rank != null && !data.entries.some((e) => e.is_you)

  return (
    <div className="mx-auto max-w-lg px-4 py-5 lg:max-w-3xl lg:px-8 lg:py-8">
      <PageHeader title={t('leaderboard.title')} />
      <p className="-mt-3 mb-4 text-sm text-gray-500 dark:text-gray-400">{t('leaderboard.subtitle')}</p>

      <SegmentedTabs
        options={[
          { id: 'referrals', label: t('leaderboard.tabs.referrals') },
          { id: 'activity', label: t('leaderboard.tabs.activity') },
        ]}
        value={kind}
        onChange={setKind}
      />

      <Card className="mt-4 text-left">
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        )}

        {!loading && (!data || data.entries.length === 0) && (
          <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-600">{t('leaderboard.empty')}</p>
        )}

        {!loading && data && data.entries.length > 0 && (
          <div className="space-y-1">
            {data.entries.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-3 rounded-xl px-2 py-2 ${
                  entry.is_you ? 'bg-gray-100 dark:bg-white/10' : ''
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    RANK_STYLES[entry.rank] ?? 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400'
                  }`}
                >
                  {entry.rank}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {entry.name ?? t('leaderboard.anonymous')}
                  {entry.is_you && <span className="ml-1.5 text-xs text-gray-400">({t('leaderboard.you')})</span>}
                </span>
                <span className="shrink-0 text-sm font-semibold text-gray-500 dark:text-gray-400">
                  {entry.value} {valueLabel}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {!loading && showMyRank && (
        <Card className="mt-3 text-left">
          <div className="flex items-center gap-3 px-2 py-1">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white dark:bg-white dark:text-black">
              <Crown size={13} />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{t('leaderboard.yourRank', { n: data!.my_rank! })}</span>
            <span className="shrink-0 text-sm font-semibold text-gray-500 dark:text-gray-400">
              {data!.my_value} {valueLabel}
            </span>
          </div>
        </Card>
      )}
    </div>
  )
}
