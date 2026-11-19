import clsx from 'clsx'
import type { ReactNode } from 'react'

interface EstadoCargaProps {
  children: ReactNode
  className?: string
}

export default function EstadoCarga({ children, className }: EstadoCargaProps) {
  return (
    <p role="status" className={clsx(className, 'text-slate-600 dark:text-slate-400')}>
      {children}
    </p>
  )
}
