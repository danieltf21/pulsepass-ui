import { Link } from 'react-router'
import type { Sede } from '../../api/sedes.tipos'
import { RUTAS } from '../../lib/rutas'
import Tarjeta from '../ui/Tarjeta'

interface TarjetaSedeProps {
  sede: Sede
}

const formatoNumero = new Intl.NumberFormat('es-CO')

export default function TarjetaSede({ sede }: TarjetaSedeProps) {
  return (
    <Tarjeta className="flex flex-col">
      <h2 className="font-titulo text-xl font-bold text-slate-900 dark:text-slate-100">{sede.name}</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="font-medium text-slate-700 dark:text-slate-300">Ciudad</dt>
          <dd className="mt-1 text-slate-600 dark:text-slate-400">{sede.city}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-700 dark:text-slate-300">Capacidad</dt>
          <dd className="mt-1 text-slate-600 dark:text-slate-400">{formatoNumero.format(sede.capacity)} personas</dd>
        </div>
      </dl>
      <div className="mt-auto pt-6">
        <Link
          to={RUTAS.sede(sede.code)}
          aria-label={`Ver sede ${sede.name}`}
          className="inline-flex rounded-lg bg-marca-600 px-4 py-3 font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
        >
          Ver sede
        </Link>
      </div>
    </Tarjeta>
  )
}
