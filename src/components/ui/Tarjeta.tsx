import clsx from 'clsx'
import type { ReactNode } from 'react'

interface TarjetaProps {
  children: ReactNode
  className?: string
  sinRelleno?: boolean
}

export default function Tarjeta({ children, className, sinRelleno = false }: TarjetaProps) {
  return (
    <article className={clsx(
      'h-full rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900',
      !sinRelleno && 'p-6',
      className,
    )}>
      {children}
    </article>
  )
}
