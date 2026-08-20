import { ChevronDown, MessagesSquare } from 'lucide-react'
import { PageHeader } from '../components/ui'
import { useT } from '../lib/i18n'

const FAQ_KEYS = [
  { q: 'community.faq.q1', a: 'community.faq.a1' },
  { q: 'community.faq.q2', a: 'community.faq.a2' },
  { q: 'community.faq.q3', a: 'community.faq.a3' },
]

export default function CommunityPage() {
  const t = useT()

  return (
    <div className="mx-auto max-w-lg px-4 py-5 lg:max-w-3xl lg:px-8 lg:py-8">
      <PageHeader title={t('community.title')} />

      <div className="flex items-center gap-3 rounded-2xl bg-black p-4 text-left text-white shadow-sm dark:bg-white dark:text-black">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 dark:bg-black/10">
          <MessagesSquare size={18} />
        </div>
        <div>
          <p className="font-semibold">{t('community.groupTitle')}</p>
          <p className="mt-0.5 text-sm text-white/75 dark:text-black/65">{t('community.groupDescription')}</p>
        </div>
      </div>

      <h2 className="mt-6 mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">{t('community.faq')}</h2>
      <div className="space-y-2">
        {FAQ_KEYS.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-gray-200 bg-white p-3.5 text-left shadow-sm dark:border-white/5 dark:bg-white/[0.03]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
              {t(item.q)}
              <ChevronDown size={16} className="text-gray-400 transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t(item.a)}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
