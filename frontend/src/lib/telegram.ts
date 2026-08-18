import WebApp from '@twa-dev/sdk'

export function initTelegram() {
  if (!isRunningInTelegram()) return
  WebApp.ready()
  WebApp.expand()
}

export function isRunningInTelegram(): boolean {
  return Boolean(WebApp.initData)
}

export function getInitData(): string {
  return WebApp.initData
}

export function getTelegramUser() {
  return WebApp.initDataUnsafe?.user
}

export { WebApp }
