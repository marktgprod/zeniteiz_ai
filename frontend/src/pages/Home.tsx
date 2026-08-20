import { Link } from 'react-router-dom'
import { MessageSquare, Image, Video, Sparkles, ArrowRight } from 'lucide-react'
import { useUserStore } from '../store/userStore'
import { isRunningInTelegram } from '../lib/telegram'
import { useT } from '../lib/i18n'

const QUICK_ACTIONS = [
  { to: '/text', labelKey: 'nav.text', hintKey: 'home.text.hint', icon: MessageSquare },
  { to: '/images', labelKey: 'nav.images', hintKey: 'home.images.hint', icon: Image },
  { to: '/video', labelKey: 'nav.video', hintKey: 'home.video.hint', icon: Video },
  { to: '/prompts', labelKey: 'nav.prompts', hintKey: 'home.prompts.hint', icon: Sparkles },
]

export default function Home() {
  const { requestsToday, authChecked } = useUserStore()
  const inTelegram = isRunningInTelegram()
  const t = useT()

  return (
    <div className="mx-auto max-w-lg px-4 py-5 lg:max-w-3xl lg:px-8 lg:py-8">
      <div className="relative overflow-hidden rounded-2xl bg-black p-5 text-white shadow-lg dark:bg-white dark:text-black">
        <div className="pointer-events-none absolute -right-6 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl dark:bg-black/5" />
        <p className="text-sm font-medium text-white/70 dark:text-black/60">{t('home.welcome')}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{t('home.title')}</h1>
        <p className="mt-2 text-sm text-white/80 dark:text-black/70">{t('home.requestsToday', { n: requestsToday })}</p>
      </div>

      {authChecked && !inTelegram && (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
          {t('home.outsideTelegram')}
        </p>
      )}

      <h2 className="mt-6 mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400">{t('home.quickActions')}</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.to}
              to={action.to}
              className="group rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:border-gray-400 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/30"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white">
                <Icon size={18} strokeWidth={2} />
              </div>
              <p className="mt-3 font-semibold">{t(action.labelKey)}</p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{t(action.hintKey)}</p>
              <ArrowRight
                size={14}
                className="mt-2 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-900 dark:text-gray-600 dark:group-hover:text-white"
              />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
