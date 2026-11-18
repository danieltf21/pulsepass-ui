import type { EstadoEvento, ResumenEvento } from '../../api/eventos.tipos'
import { Link } from 'react-router'
import { RUTAS } from '../../lib/rutas'
import { formatearFecha } from '../../lib/formato'
import { etiquetasCategoria } from '../../lib/categoriasEvento'

const etiquetasEstado: Record<EstadoEvento, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  SOLD_OUT: 'Agotado',
  CANCELLED: 'Cancelado',
  FINISHED: 'Finalizado',
}

interface TarjetaEventoProps {
  evento: ResumenEvento
}

export default function TarjetaEvento({ evento }: TarjetaEventoProps) {
  return (
    <article className="h-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <div className="flex flex-wrap gap-2 text-sm font-medium">
        <span className="rounded-full bg-marca-50 dark:bg-indigo-950 px-3 py-1 text-marca-700 dark:text-indigo-300">{etiquetasCategoria[evento.category]}</span>
        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-300">{etiquetasEstado[evento.status]}</span>
      </div>
      <h2 className="mt-4 font-titulo text-xl font-bold">{evento.name}</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{evento.eventCode}</p>
      <p className="mt-4 text-slate-600 dark:text-slate-400">
        <time dateTime={evento.eventDate}>
          {formatearFecha(evento.eventDate)}
        </time>
      </p>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{evento.venueName}</p>
      <Link
        to={RUTAS.evento(evento.eventCode)}
        aria-label={`Ver detalle de ${evento.name}`}
        className="mt-6 inline-flex rounded-lg bg-marca-600 px-4 py-2 font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
      >
        Ver detalle
      </Link>
    </article>
  )
}
