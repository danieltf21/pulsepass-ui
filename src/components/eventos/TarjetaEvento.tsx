import type { ResumenEvento } from '../../api/eventos.tipos'
import { Link } from 'react-router'
import { RUTAS } from '../../lib/rutas'
import { formatearFecha } from '../../lib/formato'
import { etiquetasCategoria } from '../../lib/categoriasEvento'
import { etiquetasEstadoEvento } from '../../lib/estadosEvento'
import Badge from '../ui/Badge'
import Tarjeta from '../ui/Tarjeta'
import PanelCategoriaEvento from './PanelCategoriaEvento'

interface TarjetaEventoProps {
  evento: ResumenEvento
}

export default function TarjetaEvento({ evento }: TarjetaEventoProps) {
  return (
    <Tarjeta sinRelleno className="flex flex-col overflow-hidden motion-safe:transition-transform motion-safe:hover:-translate-y-0.5">
      <PanelCategoriaEvento categoria={evento.category} className="h-36" />
      <div className="flex flex-1 flex-col items-start p-4">
        <Badge variante={evento.category}>{etiquetasCategoria[evento.category]}</Badge>
        <h2 className="mt-2 font-titulo text-lg font-bold wrap-anywhere">{evento.name}</h2>
        <p className="mt-1 font-mono text-sm wrap-anywhere text-slate-600 dark:text-slate-400">{evento.eventCode}</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          <time dateTime={evento.eventDate}>{formatearFecha(evento.eventDate)}</time>
        </p>
        <p className="mt-1 text-sm wrap-anywhere text-slate-600 dark:text-slate-400">{evento.venueName}</p>
        <div className="mt-2"><Badge variante={evento.status}>{etiquetasEstadoEvento[evento.status]}</Badge></div>
        <Link
          to={RUTAS.evento(evento.eventCode)}
          aria-label={`Ver detalle de ${evento.name}`}
          className="mt-auto inline-flex min-h-11 items-center rounded-md pt-1 text-sm font-semibold text-marca-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:text-indigo-300"
        >
          Ver detalle
        </Link>
      </div>
    </Tarjeta>
  )
}
