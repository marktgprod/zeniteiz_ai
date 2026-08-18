import { WebApp, isRunningInTelegram } from './telegram'

type ImpactStyle = 'light' | 'medium' | 'heavy'
type NotificationType = 'success' | 'error' | 'warning'

export function haptic(type: ImpactStyle | NotificationType = 'light') {
  if (!isRunningInTelegram()) return
  try {
    if (type === 'success' || type === 'error' || type === 'warning') {
      WebApp.HapticFeedback.notificationOccurred(type)
    } else {
      WebApp.HapticFeedback.impactOccurred(type)
    }
  } catch {
    // Older Telegram clients may not support the Haptic Feedback API — ignore.
  }
}
