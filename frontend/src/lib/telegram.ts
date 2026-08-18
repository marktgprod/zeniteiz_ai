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
  // initData is the primary signal, but platform is set by the Telegram client
  // independently of it (and defaults to 'unknown' outside Telegram) — checking
  // both guards against edge cases where initData alone comes back empty even
  // though we're genuinely running inside a Telegram WebView. Wrapped because
  // this runs on every render (Layout, Home) — it must never throw.
  try {
    return Boolean(WebApp.initData) || Boolean(WebApp.initDataUnsafe?.user) || WebApp.platform !== 'unknown'
  } catch {
    return false
  }
}

export function getInitData(): string {
  return WebApp.initData
}

export function getTelegramUser() {
  return WebApp.initDataUnsafe?.user
}

export { WebApp }
