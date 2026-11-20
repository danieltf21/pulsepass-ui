import clsx from 'clsx'
import type { ReactNode } from 'react'

interface EstadoCargaProps {
  children: ReactNode
  className?: string
}

export default function EstadoCarga({ children, className }: EstadoCargaProps) {
  return (
    <div role="status" className={clsx(className, 'rounded-xl border border-slate-200 bg-white p-4 text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400')}>
      <p>{children}</p>
      <div aria-hidden="true" className="mt-3 grid gap-2 motion-safe:animate-pulse">
        <div className="h-3 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  )
}
