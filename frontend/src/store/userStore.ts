import { create } from 'zustand'

export type SubscriptionTier = 'FREE' | 'STARTER' | 'PRO' | 'VIP'

interface UserState {
  id: string | null
  telegramUserId: number | null
  username: string | null
  subscriptionTier: SubscriptionTier
  subscriptionExpiresAt: string | null
  requestsToday: number
  authChecked: boolean
  setUser: (user: Partial<Omit<UserState, 'setUser'>>) => void
}

export const useUserStore = create<UserState>((set) => ({
  id: null,
  telegramUserId: null,
  username: null,
  subscriptionTier: 'FREE',
  subscriptionExpiresAt: null,
  requestsToday: 0,
  authChecked: false,
  setUser: (user) => set(user),
}))
