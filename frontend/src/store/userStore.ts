import { create } from 'zustand'

export type SubscriptionTier = 'FREE' | 'STARTER' | 'PRO' | 'VIP'
export type Language = 'ru' | 'en'

interface UserState {
  id: string | null
  telegramUserId: number | null
  username: string | null
  subscriptionTier: SubscriptionTier
  subscriptionExpiresAt: string | null
  requestsToday: number
  language: Language
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
  language: 'ru',
  authChecked: false,
  setUser: (user) => set(user),
}))
