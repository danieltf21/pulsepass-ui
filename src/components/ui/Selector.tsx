import clsx from 'clsx'
import type { ComponentPropsWithRef } from 'react'

export default function Selector({ className, ...props }: ComponentPropsWithRef<'select'>) {
  return (
    <select
      {...props}
      className={clsx(
        'min-h-11 rounded-lg border border-slate-500 bg-white px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:bg-slate-900',
        className,
      )}
    />
  )
}
