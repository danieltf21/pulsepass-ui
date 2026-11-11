import type { EstadoEvento, ResumenEvento } from '../../api/eventos.tipos'
import { Link } from 'react-router'

const etiquetasEstado: Record<EstadoEvento, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  SOLD_OUT: 'Agotado',
  CANCELLED: 'Cancelado',
  FINISHED: 'Finalizado',
}

const formatoFecha = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'long',
  timeStyle: 'short',
})

interface TarjetaEventoProps {
  evento: ResumenEvento
}

export default function TarjetaEvento({ evento }: TarjetaEventoProps) {
  return (
    <article className="h-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
        {etiquetasEstado[evento.status]}
      </span>
      <h2 className="mt-4 font-titulo text-xl font-bold">{evento.name}</h2>
      <p className="mt-2 text-sm text-slate-500">{evento.eventCode}</p>
      <p className="mt-4 text-slate-600">
        <time dateTime={evento.eventDate}>
          {formatoFecha.format(new Date(evento.eventDate))}
        </time>
      </p>
      <p className="mt-2 text-slate-600">{evento.venueName}</p>
      <Link
        to={`/eventos/${encodeURIComponent(evento.eventCode)}`}
        aria-label={`Ver detalle de ${evento.name}`}
        className="mt-6 inline-flex rounded-lg bg-marca-600 px-4 py-2 font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
      >
        Ver detalle
      </Link>
    </article>
  )
}
