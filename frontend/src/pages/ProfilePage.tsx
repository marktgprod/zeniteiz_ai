import { useState } from 'react'
import axios from 'axios'
import { Check } from 'lucide-react'
import { api } from '../lib/api'
import { useUserStore, type SubscriptionTier } from '../store/userStore'
import { Notice, PageHeader, PrimaryButton } from '../components/ui'
import { track } from '../lib/analytics'
import { haptic } from '../lib/haptics'

const TIERS: {
  id: SubscriptionTier
  name: string
  price: string
  features: string[]
}[] = [
  {
    id: 'STARTER',
    name: 'Starter',
    price: '299 ₽/мес',
    features: ['Claude Sonnet 5 + GPT-4o mini', 'До 50 запросов в день', 'Библиотека промптов', 'Ежедневный digest новостей'],
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: '799 ₽/мес',
    features: ['Всё из Starter', 'Flux.1 Pro + DALL-E 3', 'До 100 запросов в день', 'Промпт-генератор'],
  },
  {
    id: 'VIP',
    name: 'VIP / Lifetime',
    price: '3999 ₽ разово',
    features: ['Всё из Pro', 'Runway Gen-3 (видео)', 'Безлимитные запросы', 'Личный чат с разработчиком'],
  },
]

export default function ProfilePage() {
  const { id, subscriptionTier, requestsToday } = useUserStore()
  const [pendingTier, setPendingTier] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const handleUpgrade = async (tier: SubscriptionTier) => {
    haptic('light')
    track('upgrade_click', { tier })

    if (!id) {
      setNotice('Откройте приложение через Telegram-бота, чтобы оформить подписку.')
      return
    }

    setPendingTier(tier)
    setNotice(null)
    try {
      await api.post(`/api/user/${id}/upgrade`, null, { params: { tier } })
      haptic('success')
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 501) {
        setNotice('Оплата через Tribute ещё не подключена — появится на следующем этапе.')
        haptic('warning')
      } else {
        setNotice('Не удалось начать оформление подписки.')
        haptic('error')
      }
    } finally {
      setPendingTier(null)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-5">
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

      <div className="space-y-3">
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
                  onClick={() => handleUpgrade(tier.id)}
                  disabled={isCurrent || pendingTier === tier.id}
                  className="mt-4 w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-85 disabled:opacity-50 dark:bg-black dark:text-white"
                >
                  {isCurrent ? 'Текущий тариф' : pendingTier === tier.id ? 'Оформление...' : `Выбрать ${tier.name}`}
                </button>
              ) : (
                <PrimaryButton
                  onClick={() => handleUpgrade(tier.id)}
                  disabled={isCurrent || pendingTier === tier.id}
                  className="mt-4 w-full"
                >
                  {isCurrent ? 'Текущий тариф' : pendingTier === tier.id ? 'Оформление...' : `Выбрать ${tier.name}`}
                </PrimaryButton>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
