import { useUserStore } from '../store/userStore'

export default function Home() {
  const { subscriptionTier, requestsToday } = useUserStore()

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-2xl font-semibold">AI All-in-One Hub</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Текущий тариф: <span className="font-medium">{subscriptionTier}</span>
      </p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Запросов сегодня: {requestsToday}
      </p>
    </div>
  )
}
