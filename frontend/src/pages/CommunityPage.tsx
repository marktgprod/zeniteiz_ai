import { ChevronDown, MessagesSquare } from 'lucide-react'
import { PageHeader } from '../components/ui'

const FAQ = [
  {
    q: 'Как продлить подписку?',
    a: 'Откройте раздел «Профиль» и выберите тариф — оплата проходит через Tribute прямо в Telegram.',
  },
  {
    q: 'Что входит в бесплатный пробный период?',
    a: '3 дня доступа уровня Starter: Claude Sonnet 5, GPT-4o mini и библиотека промптов.',
  },
  {
    q: 'Что делать, если закончились запросы на сегодня?',
    a: 'Лимит обновляется каждый день в 00:00 МСК, либо повысьте тариф в профиле для большего количества запросов.',
  },
]

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-5 lg:max-w-3xl lg:px-8 lg:py-8">
      <PageHeader title="Сообщество" />

      <div className="flex items-center gap-3 rounded-2xl bg-black p-4 text-left text-white shadow-sm dark:bg-white dark:text-black">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 dark:bg-black/10">
          <MessagesSquare size={18} />
        </div>
        <div>
          <p className="font-semibold">Закрытая группа для подписчиков</p>
          <p className="mt-0.5 text-sm text-white/75 dark:text-black/65">
            Доступ выдаётся автоматически при оформлении подписки — искать ссылку не нужно.
          </p>
        </div>
      </div>

      <h2 className="mt-6 mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">FAQ</h2>
      <div className="space-y-2">
        {FAQ.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-gray-200 bg-white p-3.5 text-left shadow-sm dark:border-white/5 dark:bg-white/[0.03]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
              {item.q}
              <ChevronDown size={16} className="text-gray-400 transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
