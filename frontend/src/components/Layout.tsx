import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Home, MessageSquare, Image, Video, Sparkles, Newspaper, Users, User } from 'lucide-react'
import { useUserStore } from '../store/userStore'
import { useVideoStore } from '../store/videoStore'
import { track } from '../lib/analytics'
import { haptic } from '../lib/haptics'

const NAV_ITEMS = [
  { to: '/', label: 'Главная', end: true, icon: Home },
  { to: '/text', label: 'Текст', icon: MessageSquare },
  { to: '/images', label: 'Фото', icon: Image },
  { to: '/video', label: 'Видео', icon: Video },
  { to: '/prompts', label: 'Промпты', icon: Sparkles },
  { to: '/news', label: 'Новости', icon: Newspaper },
  { to: '/community', label: 'Люди', icon: Users },
  { to: '/profile', label: 'Профиль', icon: User },
]

const TIER_STYLES: Record<string, string> = {
  FREE: 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400',
  STARTER: 'bg-gray-200 text-gray-700 dark:bg-white/15 dark:text-gray-200',
  PRO: 'bg-gray-900 text-white dark:bg-white/30 dark:text-white',
  VIP: 'bg-black text-white dark:bg-white dark:text-black',
}

export default function Layout() {
  const subscriptionTier = useUserStore((s) => s.subscriptionTier)
  const videoPending = useVideoStore((s) => s.status === 'pending')
  const location = useLocation()

  useEffect(() => {
    track('page_view', { path: location.pathname })
  }, [location.pathname])

  return (
    <div className="min-h-svh bg-white text-gray-900 dark:bg-black dark:text-gray-100">
      {/* Desktop sidebar — hidden on phone, where the bottom nav below is used instead */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-56 flex-col border-r border-gray-200/80 bg-white px-4 py-5 dark:border-white/10 dark:bg-black lg:flex">
        <div className="flex items-center gap-2 px-1">
          <img src="/logo.jpeg" alt="" className="h-7 w-7 rounded-lg object-cover dark:ring-1 dark:ring-white/15" />
          <span className="text-sm font-semibold tracking-tight">Zeniteiz Ai</span>
        </div>
        <span
          className={`mt-3 w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold ${TIER_STYLES[subscriptionTier]}`}
        >
          {subscriptionTier}
        </span>

        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => haptic('light')}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-100 text-black dark:bg-white/10 dark:text-white'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                  }`
                }
              >
                <span className="relative">
                  <Icon size={18} strokeWidth={2} />
                  {item.to === '/video' && videoPending && (
                    <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                  )}
                </span>
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>

      <div className="flex min-h-svh flex-col lg:pl-56">
        {/* Mobile-only top bar — desktop shows brand/tier in the sidebar instead */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200/80 bg-white/90 px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-black/90 lg:hidden">
          <div className="flex items-center gap-1.5">
            <img src="/logo.jpeg" alt="" className="h-6 w-6 rounded-lg object-cover dark:ring-1 dark:ring-white/15" />
            <span className="text-sm font-semibold tracking-tight">Zeniteiz Ai</span>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${TIER_STYLES[subscriptionTier]}`}>
            {subscriptionTier}
          </span>
        </header>

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-10">
          <Outlet />
        </main>

        {/* Mobile-only bottom nav — desktop uses the sidebar instead */}
        <nav className="fixed inset-x-0 bottom-0 z-10 flex overflow-x-auto border-t border-gray-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md dark:border-white/10 dark:bg-black/95 lg:hidden">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => haptic('light')}
                className={({ isActive }) =>
                  `flex min-w-[64px] flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                    isActive
                      ? 'text-black dark:text-white'
                      : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`relative flex h-6 w-6 items-center justify-center rounded-lg ${
                        isActive ? 'bg-gray-100 dark:bg-white/10' : ''
                      }`}
                    >
                      <Icon size={18} strokeWidth={2} />
                      {item.to === '/video' && videoPending && (
                        <span className="absolute right-0 top-0 h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                      )}
                    </div>
                    {item.label}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
