import type { WebApp as WebAppType } from '@twa-dev/types'

declare global {
  interface Window {
    Telegram?: { WebApp: WebAppType }
  }
}

// Reads the object the official telegram-web-app.js script (loaded in
// index.html) sets up. We only use @twa-dev/types for typing here — importing
// @twa-dev/sdk's runtime would pull in its own bundled copy of that same
// script, which fought with the official one and crashed the app on load.
export const WebApp = window.Telegram?.WebApp

const BG_LIGHT = '#ffffff'
const BG_DARK = '#000000'

export function initTelegram() {
  if (!isRunningInTelegram() || !WebApp) return
  WebApp.ready()
  WebApp.expand()

  const bg = WebApp.colorScheme === 'dark' ? BG_DARK : BG_LIGHT
  WebApp.setHeaderColor(bg)
  WebApp.setBackgroundColor(bg)
  WebApp.setBottomBarColor?.(bg)
}

export function isRunningInTelegram(): boolean {
  // Wrapped because this runs on every render (Layout, Home) — it must never throw.
  try {
    if (!WebApp) return false
    return Boolean(WebApp.initData) || Boolean(WebApp.initDataUnsafe?.user) || WebApp.platform !== 'unknown'
  } catch {
    return false
  }
}

export function getInitData(): string {
  return WebApp?.initData ?? ''
}

export function getTelegramUser() {
  return WebApp?.initDataUnsafe?.user
}
