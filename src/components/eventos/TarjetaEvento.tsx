import type { ResumenEvento } from '../../api/eventos.tipos'
import { Link } from 'react-router'
import { RUTAS } from '../../lib/rutas'
import { formatearFecha } from '../../lib/formato'
import { etiquetasCategoria } from '../../lib/categoriasEvento'
import { etiquetasEstadoEvento } from '../../lib/estadosEvento'
import Badge from '../ui/Badge'
import Tarjeta from '../ui/Tarjeta'

interface TarjetaEventoProps {
  evento: ResumenEvento
}

export default function TarjetaEvento({ evento }: TarjetaEventoProps) {
  return (
    <Tarjeta>
      <div className="flex flex-wrap gap-2 text-sm font-medium">
        <Badge variante="marca">{etiquetasCategoria[evento.category]}</Badge>
        <Badge>{etiquetasEstadoEvento[evento.status]}</Badge>
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
    </Tarjeta>
  )
}
