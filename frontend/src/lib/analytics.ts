import { api } from './api'
import { useUserStore } from '../store/userStore'

export function track(eventName: string, data?: Record<string, unknown>) {
  const userId = useUserStore.getState().id
  api.post('/api/events', { event_name: eventName, user_id: userId, data }).catch(() => {})
}
