import clsx from 'clsx'
import type { ReactNode } from 'react'

const clasesPorVariante = {
  marca: 'bg-marca-50 text-marca-700 dark:bg-indigo-950 dark:text-indigo-300',
  neutra: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

interface BadgeProps {
  children: ReactNode
  variante?: keyof typeof clasesPorVariante
  as?: 'span' | 'p'
  className?: string
}

export default function Badge({ children, variante = 'neutra', as: Elemento = 'span', className }: BadgeProps) {
  return (
    <Elemento className={clsx('rounded-full px-3 py-1', clasesPorVariante[variante], className)}>
      {children}
    </Elemento>
  )
}
