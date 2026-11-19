import clsx from 'clsx'
import type { ComponentPropsWithRef } from 'react'

export default function Boton({ type = 'button', className, ...props }: ComponentPropsWithRef<'button'>) {
  return (
    <button
      {...props}
      type={type}
      className={clsx(
        'rounded-lg bg-marca-600 px-4 py-3 text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:opacity-60',
        className,
      )}
    />
  )
}
