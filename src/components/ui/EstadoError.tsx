import type { ReactNode } from 'react'

interface EstadoErrorProps {
  titulo: string
  mensaje: string
  children?: ReactNode
}

export default function EstadoError({ titulo, mensaje, children }: EstadoErrorProps) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950">
      <h2 className="text-lg font-semibold text-red-900 dark:text-red-200">{titulo}</h2>
      <p className="mt-2 text-red-800 dark:text-red-200">{mensaje}</p>
      {children}
    </div>
  )
}
