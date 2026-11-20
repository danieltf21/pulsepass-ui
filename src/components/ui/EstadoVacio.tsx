import type { ReactNode } from 'react'

export default function EstadoVacio({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
      {children}
    </p>
  )
}
