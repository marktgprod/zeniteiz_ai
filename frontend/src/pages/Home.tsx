import { Link } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { isRunningInTelegram } from '../lib/telegram'

const QUICK_ACTIONS = [
  { to: '/text', label: 'Текст', hint: 'Claude · GPT-4o mini' },
  { to: '/images', label: 'Изображения', hint: 'Flux.1 Pro · DALL-E 3' },
  { to: '/video', label: 'Видео', hint: 'Runway Gen-3' },
  { to: '/prompts', label: 'Промпты', hint: 'Библиотека готовых запросов' },
]

export default function Home() {
  const { subscriptionTier, requestsToday, authChecked } = useUserStore()
  const inTelegram = isRunningInTelegram()

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-2xl font-semibold">AI Hub</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Тариф: <span className="font-medium text-gray-900 dark:text-gray-100">{subscriptionTier}</span> · запросов
        сегодня: {requestsToday}
      </p>

      {authChecked && !inTelegram && (
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          Вы открыли приложение вне Telegram — для полноценной работы (сохранение подписки, лимитов) откройте его
          через бота.
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="rounded-xl border border-gray-200 p-4 text-left dark:border-gray-800"
          >
            <p className="font-medium">{action.label}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{action.hint}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
