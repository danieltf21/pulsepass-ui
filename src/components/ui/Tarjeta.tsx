import clsx from 'clsx'
import type { ReactNode } from 'react'

interface TarjetaProps {
  children: ReactNode
  className?: string
}

export default function Tarjeta({ children, className }: TarjetaProps) {
  return (
    <article className={clsx(
      'h-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900',
      className,
    )}>
      {children}
    </article>
  )
}
