import { Link } from 'react-router'
import type { DetalleEvento } from '../../api/eventos.tipos'
import { etiquetasCategoria } from '../../lib/categoriasEvento'
import { etiquetasEstadoEvento } from '../../lib/estadosEvento'
import { formatearFecha } from '../../lib/formato'
import { RUTAS } from '../../lib/rutas'
import Badge from '../ui/Badge'

interface DatosEventoProps {
  evento: DetalleEvento
}

export default function DatosEvento({ evento }: DatosEventoProps) {
  return (
    <>
      <div className="flex flex-wrap gap-2 text-sm font-medium">
        <Badge variante={evento.category}>{etiquetasCategoria[evento.category]}</Badge>
        <Badge variante={evento.status}>{etiquetasEstadoEvento[evento.status]}</Badge>
      </div>
      <h1 className="mt-5 font-titulo text-3xl font-bold">{evento.name}</h1>
      <p className="mt-2 font-mono text-sm wrap-anywhere text-slate-600 dark:text-slate-400">{evento.eventCode}</p>
      <p className="mt-6 whitespace-pre-line leading-relaxed text-slate-600 dark:text-slate-400">
        {evento.description?.trim() || 'Este evento aún no tiene descripción.'}
      </p>

      <dl className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <dt className="font-semibold">Fecha y hora</dt>
          <dd className="mt-1 text-slate-600 dark:text-slate-400">
            <time dateTime={evento.eventDate}>{formatearFecha(evento.eventDate)}</time>
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Edad mínima</dt>
          <dd className="mt-1 text-slate-600 dark:text-slate-400">{evento.minimumAge} años</dd>
        </div>
        <div>
          <dt className="font-semibold">Sede</dt>
          <dd className="mt-1 text-slate-600 dark:text-slate-400">
            <Link
              to={RUTAS.sede(evento.venueCode)}
              className="rounded font-mono wrap-anywhere text-marca-700 dark:text-indigo-300 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
            >
              {evento.venueName} ({evento.venueCode})
            </Link>
          </dd>
        </div>
      </dl>
    </>
  )
}
