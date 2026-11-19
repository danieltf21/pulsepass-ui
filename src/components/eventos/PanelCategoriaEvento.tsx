import clsx from 'clsx'
import type { CategoriaEvento } from '../../api/eventos.tipos'
import { coloresCategoria } from '../../lib/categoriasEvento'

const trazosPorCategoria: Record<CategoriaEvento, string> = {
  MUSIC: 'M9 18V5l12-2v13M9 18a3 2 0 1 1-6 0 3 2 0 0 1 6 0Zm12-2a3 2 0 1 1-6 0 3 2 0 0 1 6 0Z',
  SPORTS: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3v18M6 5.5a9 9 0 0 1 0 13m12-13a9 9 0 0 0 0 13',
  TECHNOLOGY: 'M3 4h18v12H3zM12 16v4m-4 0h8',
  EDUCATION: 'm2 9 10-5 10 5-10 5L2 9Zm4 2v6c3 3 9 3 12 0v-6m4-2v7',
  CULTURE: 'm2 9 10-6 10 6M4 21h16M5 10v11m7-11v11m7-11v11',
  ENTERTAINMENT: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z',
}

export default function PanelCategoriaEvento({ categoria, className }: {
  categoria: CategoriaEvento
  className?: string
}) {
  return (
    <div aria-hidden="true" className={clsx('grid place-items-center', coloresCategoria[categoria], className)}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
        strokeLinecap="round" strokeLinejoin="round" className="size-10">
        <path d={trazosPorCategoria[categoria]} />
      </svg>
    </div>
  )
}
