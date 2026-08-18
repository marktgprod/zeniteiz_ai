import { create } from 'zustand'

export type SubscriptionTier = 'FREE' | 'STARTER' | 'PRO' | 'VIP'

interface UserState {
  telegramUserId: number | null
  username: string | null
  subscriptionTier: SubscriptionTier
  subscriptionExpiresAt: string | null
  requestsToday: number
  setUser: (user: Partial<Omit<UserState, 'setUser'>>) => void
}

export const useUserStore = create<UserState>((set) => ({
  telegramUserId: null,
  username: null,
  subscriptionTier: 'FREE',
  subscriptionExpiresAt: null,
  requestsToday: 0,
  setUser: (user) => set(user),
}))
