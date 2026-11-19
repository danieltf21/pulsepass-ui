import clsx from 'clsx'
import type { ReactNode } from 'react'
import { coloresCategoria } from '../../lib/categoriasEvento'

const clasesPorVariante = {
  ...coloresCategoria,
  marca: 'bg-marca-50 text-marca-700 dark:bg-indigo-950 dark:text-indigo-300',
  neutra: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  DRAFT: 'bg-slate-200 text-slate-700',
  PUBLISHED: 'bg-emerald-100 text-emerald-800',
  SOLD_OUT: 'bg-amber-100 text-amber-800',
  CANCELLED: 'bg-red-100 text-red-800',
  FINISHED: 'bg-slate-300 text-slate-800',
  RESERVED: 'bg-sky-100 text-sky-800',
  PAID: 'bg-emerald-100 text-emerald-800',
  USED: 'bg-slate-300 text-slate-800',
}

interface BadgeProps {
  children: ReactNode
  variante?: keyof typeof clasesPorVariante
  as?: 'span' | 'p'
  className?: string
}

export default function Badge({ children, variante = 'neutra', as: Elemento = 'span', className }: BadgeProps) {
  return (
    <Elemento className={clsx('inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold', clasesPorVariante[variante], className)}>
      {children}
    </Elemento>
  )
}
