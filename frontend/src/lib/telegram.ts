import WebApp from '@twa-dev/sdk'

const BG_LIGHT = '#ffffff'
const BG_DARK = '#000000'

export function initTelegram() {
  if (!isRunningInTelegram()) return
  WebApp.ready()
  WebApp.expand()

  const bg = WebApp.colorScheme === 'dark' ? BG_DARK : BG_LIGHT
  WebApp.setHeaderColor(bg)
  WebApp.setBackgroundColor(bg)
  WebApp.setBottomBarColor?.(bg)
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
