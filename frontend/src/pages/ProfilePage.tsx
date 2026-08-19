import { useEffect, useState } from 'react'
import { Check, ChevronRight, BarChart3, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useUserStore, type SubscriptionTier } from '../store/userStore'
import { Card, Notice, PageHeader, PrimaryButton } from '../components/ui'
import { track } from '../lib/analytics'
import { haptic } from '../lib/haptics'
import { WebApp } from '../lib/telegram'

interface LevelInfo {
  index: number
  name: string
  threshold: number
  reward_text: string
  unlocked: boolean
}

interface Loyalty {
  generations: number
  level_index: number
  level_name: string
  next_level_name: string | null
  next_level_threshold: number | null
  reward_tier: SubscriptionTier | null
  reward_expires_at: string | null
  reward_video_credits: number
  levels: LevelInfo[]
}

const TIERS: {
  id: SubscriptionTier
  name: string
  price: string
  tributeLink: string
  features: string[]
}[] = [
  {
    id: 'STARTER',
    name: 'Starter',
    price: '3 €/мес',
    tributeLink: 'https://t.me/tribute/app?startapp=s13MQ',
    features: ['Claude Sonnet 5 + GPT-4o mini', 'До 50 запросов в день', 'Библиотека промптов', 'Ежедневный digest новостей'],
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: '8 €/мес',
    tributeLink: 'https://t.me/tribute/app?startapp=s13MR',
    features: ['Всё из Starter', 'Flux.1 Pro', 'До 100 запросов в день', 'Промпт-генератор'],
  },
  {
    id: 'VIP',
    name: 'VIP',
    price: '40 €/год',
    tributeLink: 'https://t.me/tribute/app?startapp=s13N2',
    features: ['Всё из Pro', 'MiniMax Video-01 (видео)', 'Безлимитные запросы', 'Личный чат с разработчиком'],
  },
]

export default function ProfilePage() {
  const { id, subscriptionTier, requestsToday } = useUserStore()
  const [notice, setNotice] = useState<string | null>(null)
  const [loyalty, setLoyalty] = useState<Loyalty | null>(null)

  useEffect(() => {
    if (!id) return
    api
      .get<Loyalty>(`/api/user/${id}/loyalty`)
      .then((res) => setLoyalty(res.data))
      .catch(() => {})
  }, [id])

  const handleUpgrade = (tier: (typeof TIERS)[number]) => {
    haptic('light')
    track('upgrade_click', { tier: tier.id })

    if (!id) {
      setNotice('Откройте приложение через Telegram-бота, чтобы оформить подписку.')
      return
    }

    setNotice(null)
    if (WebApp) {
      WebApp.openTelegramLink(tier.tributeLink)
    } else {
      window.open(tier.tributeLink, '_blank')
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-5 lg:max-w-3xl lg:px-8 lg:py-8">
      <PageHeader title="Профиль и подписка" />
      <p className="-mt-3 mb-4 text-sm text-gray-500 dark:text-gray-400">
        Тариф: <span className="font-medium text-gray-900 dark:text-gray-100">{subscriptionTier}</span> · запросов
        сегодня: {requestsToday}
      </p>

      {notice && (
        <div className="mb-4">
          <Notice tone="amber">{notice}</Notice>
        </div>
      )}

      {loyalty && (
        <Card className="mb-4 text-left">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Уровень активности</p>
              <h2 className="mt-0.5 text-lg font-bold">{loyalty.level_name}</h2>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/10">
              <Trophy size={18} />
            </div>
          </div>

          {loyalty.next_level_threshold ? (
            <>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-black dark:bg-white"
                  style={{
                    width: `${Math.min(100, (loyalty.generations / loyalty.next_level_threshold) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                {loyalty.generations} / {loyalty.next_level_threshold} генераций до уровня «{loyalty.next_level_name}»
              </p>
            </>
          ) : (
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Максимальный уровень — всего генераций: {loyalty.generations}
            </p>
          )}

          {loyalty.reward_tier && loyalty.reward_expires_at && (
            <div className="mt-3 rounded-xl bg-black p-3 text-white dark:bg-white dark:text-black">
              <p className="text-sm font-semibold">
                🎁 Бонусный тариф {loyalty.reward_tier} до{' '}
                {new Date(loyalty.reward_expires_at).toLocaleDateString('ru-RU')}
              </p>
              {loyalty.reward_video_credits > 0 && (
                <p className="mt-0.5 text-xs opacity-80">Бесплатных видео осталось: {loyalty.reward_video_credits}</p>
              )}
            </div>
          )}

          <div className="mt-4 space-y-2">
            {loyalty.levels.map((lvl) => (
              <div key={lvl.index} className="flex items-start gap-2 text-sm">
                <div
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                    lvl.unlocked
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'bg-gray-100 text-gray-400 dark:bg-white/10 dark:text-gray-600'
                  }`}
                >
                  {lvl.unlocked ? <Check size={12} /> : lvl.index}
                </div>
                <span className={lvl.unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}>
                  <span className="font-medium">{lvl.name}</span> · {lvl.threshold} ген. — {lvl.reward_text}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="space-y-3 lg:grid lg:grid-cols-3 lg:gap-4 lg:space-y-0">
        {TIERS.map((tier) => {
          const isCurrent = subscriptionTier === tier.id
          const isVip = tier.id === 'VIP'
          return (
            <div
              key={tier.id}
              className={`rounded-2xl border p-4 text-left shadow-sm ${
                isVip
                  ? 'border-transparent bg-black text-white dark:bg-white dark:text-black'
                  : isCurrent
                    ? 'border-black bg-white dark:border-white dark:bg-white/[0.03]'
                    : 'border-gray-200 bg-white dark:border-white/5 dark:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-baseline justify-between">
                <h2 className="font-semibold">{tier.name}</h2>
                <span className={`text-sm ${isVip ? 'text-white/70 dark:text-black/60' : 'text-gray-500 dark:text-gray-400'}`}>
                  {tier.price}
                </span>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className={`flex items-start gap-2 ${isVip ? 'text-white/85 dark:text-black/80' : 'text-gray-600 dark:text-gray-300'}`}
                  >
                    <Check size={15} className={`mt-0.5 shrink-0 ${isVip ? 'text-white dark:text-black' : 'text-gray-900 dark:text-white'}`} />
                    {f}
                  </li>
                ))}
              </ul>
              {isVip ? (
                <button
                  onClick={() => handleUpgrade(tier)}
                  disabled={isCurrent}
                  className="mt-4 w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-85 disabled:opacity-50 dark:bg-black dark:text-white"
                >
                  {isCurrent ? 'Текущий тариф' : `Выбрать ${tier.name}`}
                </button>
              ) : (
                <PrimaryButton onClick={() => handleUpgrade(tier)} disabled={isCurrent} className="mt-4 w-full">
                  {isCurrent ? 'Текущий тариф' : `Выбрать ${tier.name}`}
                </PrimaryButton>
              )}
            </div>
          )
        })}
      </div>

      <Link
        to="/analytics"
        onClick={() => haptic('light')}
        className="mt-6 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-gray-400 dark:border-white/5 dark:bg-white/[0.03] dark:hover:border-white/30"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white">
          <BarChart3 size={16} />
        </div>
        <div className="flex-1">
          <p className="font-medium">Аналитика использования</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Видно только вам</p>
        </div>
        <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
      </Link>
    </div>
  )
}
