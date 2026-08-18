import { NavLink, Outlet } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Главная', end: true },
  { to: '/text', label: 'Текст' },
  { to: '/images', label: 'Изображения' },
  { to: '/video', label: 'Видео' },
  { to: '/prompts', label: 'Промпты' },
  { to: '/news', label: 'Новости' },
  { to: '/community', label: 'Сообщество' },
  { to: '/profile', label: 'Профиль' },
]

export default function Layout() {
  return (
    <div className="flex min-h-svh flex-col bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 flex overflow-x-auto border-t border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex-1 whitespace-nowrap px-3 py-2 text-center text-xs font-medium ${
                isActive
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
