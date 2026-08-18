import { useState } from 'react'
import axios from 'axios'
import { api } from '../lib/api'
import { useUserStore, type SubscriptionTier } from '../store/userStore'

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
    if (!id) {
      setNotice('Откройте приложение через Telegram-бота, чтобы оформить подписку.')
      return
    }

    setPendingTier(tier)
    setNotice(null)
    try {
      await api.post(`/api/user/${id}/upgrade`, null, { params: { tier } })
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 501) {
        setNotice('Оплата через Tribute ещё не подключена — появится на следующем этапе.')
      } else {
        setNotice('Не удалось начать оформление подписки.')
      }
    } finally {
      setPendingTier(null)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-xl font-semibold">Профиль и подписка</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Текущий тариф: <span className="font-medium text-gray-900 dark:text-gray-100">{subscriptionTier}</span> ·
        запросов сегодня: {requestsToday}
      </p>

      {notice && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          {notice}
        </p>
      )}

      <div className="mt-4 space-y-3">
        {TIERS.map((tier) => {
          const isCurrent = subscriptionTier === tier.id
          return (
            <div
              key={tier.id}
              className={`rounded-xl border p-4 text-left ${
                isCurrent ? 'border-purple-500' : 'border-gray-200 dark:border-gray-800'
              }`}
            >
              <div className="flex items-baseline justify-between">
                <h2 className="font-semibold">{tier.name}</h2>
                <span className="text-sm text-gray-500">{tier.price}</span>
              </div>
              <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                {tier.features.map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(tier.id)}
                disabled={isCurrent || pendingTier === tier.id}
                className="mt-3 w-full rounded-lg bg-purple-600 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {isCurrent ? 'Текущий тариф' : pendingTier === tier.id ? 'Оформление...' : `Выбрать ${tier.name}`}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
