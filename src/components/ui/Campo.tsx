import type { ComponentPropsWithRef } from 'react'

interface CampoProps extends Omit<ComponentPropsWithRef<'input'>, 'id' | 'className'> {
  id: string
  etiqueta: string
  error?: { message?: string }
  ayuda?: string
}

export default function Campo({ id, etiqueta, error, ayuda, ...props }: CampoProps) {
  const idError = `${id}-error`
  const idAyuda = `${id}-ayuda`

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {etiqueta}
      </label>
      <input
        {...props}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? idError : ayuda ? idAyuda : undefined}
        className="mt-2 w-full rounded-lg border border-slate-500 bg-white dark:bg-slate-900 px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
      />
      {ayuda && <p id={idAyuda} className="mt-2 text-sm text-slate-600 dark:text-slate-400">{ayuda}</p>}
      {error && <p id={idError} role="alert" className="mt-2 text-sm text-red-700 dark:text-red-200">{error.message}</p>}
    </div>
  )
}
