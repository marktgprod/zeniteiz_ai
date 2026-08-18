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
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-xl font-semibold">Сообщество</h1>

      <a
        href="https://t.me/+your_channel_here"
        target="_blank"
        rel="noreferrer"
        className="mt-3 block rounded-xl border border-purple-200 bg-purple-50 p-4 text-left dark:border-purple-900 dark:bg-purple-950"
      >
        <p className="font-medium text-purple-700 dark:text-purple-300">Закрытая группа для подписчиков</p>
        <p className="mt-1 text-sm text-purple-600 dark:text-purple-400">
          Обсуждения, поддержка и анонсы новых функций →
        </p>
      </a>

      <h2 className="mt-6 text-sm font-semibold text-gray-500 dark:text-gray-400">FAQ</h2>
      <div className="mt-2 space-y-2">
        {FAQ.map((item) => (
          <details key={item.q} className="rounded-lg border border-gray-200 p-3 text-left dark:border-gray-800">
            <summary className="cursor-pointer text-sm font-medium">{item.q}</summary>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
