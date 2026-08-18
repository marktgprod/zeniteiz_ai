import { api } from './api'
import { isRunningInTelegram } from './telegram'
import { useUserStore } from '../store/userStore'

interface LoginResponse {
  id: string
  telegram_user_id: number
  username: string | null
  subscription_tier: 'FREE' | 'STARTER' | 'PRO' | 'VIP'
  subscription_expires_at: string | null
  requests_today: number
}

export async function loginIfInTelegram(): Promise<void> {
  const setUser = useUserStore.getState().setUser

  if (!isRunningInTelegram()) {
    setUser({ authChecked: true })
    return
  }

  try {
    const res = await api.post<LoginResponse>('/api/auth/login')
    setUser({
      id: res.data.id,
      telegramUserId: res.data.telegram_user_id,
      username: res.data.username,
      subscriptionTier: res.data.subscription_tier,
      subscriptionExpiresAt: res.data.subscription_expires_at,
      requestsToday: res.data.requests_today,
      authChecked: true,
    })
  } catch {
    setUser({ authChecked: true })
  }
}
