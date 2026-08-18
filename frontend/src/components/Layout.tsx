import { NavLink, Outlet } from 'react-router-dom'
import { Home, MessageSquare, Image, Video, Sparkles, Newspaper, Users, User } from 'lucide-react'
import { useUserStore } from '../store/userStore'

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

  return (
    <div className="flex min-h-svh flex-col bg-white text-gray-900 dark:bg-black dark:text-gray-100">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200/80 bg-white/90 px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-black/90">
        <div className="flex items-center gap-1.5">
          <img src="/logo.jpeg" alt="" className="h-6 w-6 rounded-lg object-cover dark:ring-1 dark:ring-white/15" />
          <span className="text-sm font-semibold tracking-tight">Zeniteiz Ai</span>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${TIER_STYLES[subscriptionTier]}`}>
          {subscriptionTier}
        </span>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex overflow-x-auto border-t border-gray-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md dark:border-white/10 dark:bg-black/95">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
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
                    className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                      isActive ? 'bg-gray-100 dark:bg-white/10' : ''
                    }`}
                  >
                    <Icon size={18} strokeWidth={2} />
                  </div>
                  {item.label}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
