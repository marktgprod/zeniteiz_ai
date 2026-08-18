import type { ButtonHTMLAttributes, PropsWithChildren, ReactNode } from 'react'

export function PageHeader({ title, badge }: { title: string; badge?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <h1 className="text-xl font-bold tracking-tight">{title}</h1>
      {badge}
    </div>
  )
}

export function Card({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-white/[0.03] ${className}`}
    >
      {children}
    </div>
  )
}

export function PrimaryButton({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-xl bg-black py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black ${className}`}
    />
  )
}

export function Notice({ tone, children }: { tone: 'amber' | 'red'; children: ReactNode }) {
  const styles =
    tone === 'amber'
      ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300'
      : 'border-red-200 bg-red-50 text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400'
  return <p className={`rounded-xl border p-3 text-sm ${styles}`}>{children}</p>
}

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[]
  value: T
  onChange: (id: T) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
            value === o.id
              ? 'bg-black text-white shadow-sm dark:bg-white dark:text-black'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export const inputClasses =
  'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-white/10 dark:bg-white/[0.03] dark:placeholder:text-gray-500 dark:focus:border-white dark:focus:ring-white/10'
