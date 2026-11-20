import clsx from 'clsx'
import { useState, type ComponentPropsWithRef } from 'react'

interface CampoProps extends Omit<ComponentPropsWithRef<'input'>, 'id' | 'className'> {
  id: string
  etiqueta: string
  error?: { message?: string }
  ayuda?: string
  permiteVerContrasena?: boolean
}

export default function Campo({ id, etiqueta, error, ayuda, permiteVerContrasena = false, type, ...props }: CampoProps) {
  const [visible, setVisible] = useState(false)
  const mostrarControl = permiteVerContrasena && type === 'password'
  const idError = `${id}-error`
  const idAyuda = `${id}-ayuda`

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {etiqueta}
      </label>
      <div className="relative mt-2">
        <input
          {...props}
          id={id}
          type={mostrarControl && visible ? 'text' : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? idError : ayuda ? idAyuda : undefined}
          className={clsx(
            'w-full rounded-lg border border-slate-500 bg-white px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:bg-slate-900',
            mostrarControl && 'pr-14 [&::-ms-reveal]:hidden',
          )}
        />
        {mostrarControl && (
          <button
            type="button"
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-controls={id}
            onClick={() => setVisible(!visible)}
            className="absolute inset-y-0 right-1 grid w-11 place-items-center rounded-md text-slate-600 hover:text-marca-700 focus-visible:outline-2 focus-visible:outline-marca-600 dark:text-slate-300 dark:hover:text-indigo-300"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-5">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
              {visible && <path d="m3 3 18 18" />}
            </svg>
          </button>
        )}
      </div>
      {ayuda && <p id={idAyuda} className="mt-2 text-sm text-slate-600 dark:text-slate-400">{ayuda}</p>}
      {error && <p id={idError} role="alert" className="mt-2 text-sm text-red-700 dark:text-red-200">{error.message}</p>}
    </div>
  )
}
