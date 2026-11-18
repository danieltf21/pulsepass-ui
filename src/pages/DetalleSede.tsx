import { Link, useParams } from 'react-router'
import { z } from 'zod'
import { ApiError } from '../api/http'
import { useSede } from '../hooks/useSedes'
import { RUTAS } from '../lib/rutas'
import NoEncontrada from './NoEncontrada'

const codigoSchema = z.string().trim().min(1).max(50)
const formatoNumero = new Intl.NumberFormat('es-CO')

export default function DetalleSede() {
  const parametros = useParams()
  const codigo = codigoSchema.safeParse(parametros.code)
  const { data: sede, isPending, isError, error, isFetching, refetch } = useSede(
    codigo.success ? codigo.data : '',
  )

  if (!codigo.success || (error instanceof ApiError && error.status === 404)) {
    return <NoEncontrada />
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        to={RUTAS.sedes}
        className="rounded text-marca-700 dark:text-indigo-300 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
      >
        Volver a sedes
      </Link>

      {isPending ? (
        <p role="status" className="mt-8 text-slate-600 dark:text-slate-400">Cargando sede…</p>
      ) : isError ? (
        <section role="alert" className="mt-8 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6">
          <h1 className="font-titulo text-2xl font-bold">No se pudo cargar la sede</h1>
          <p className="mt-3 text-red-800 dark:text-red-200">
            {error instanceof ApiError ? error.message : 'La información recibida no tiene el formato esperado.'}
          </p>
          <button
            type="button"
            disabled={isFetching}
            onClick={() => void refetch()}
            className="mt-4 rounded-lg bg-marca-600 px-4 py-3 text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:opacity-60"
          >
            {isFetching ? 'Reintentando…' : 'Reintentar'}
          </button>
        </section>
      ) : (
        <article className="mt-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm sm:p-8">
          <h1 className="font-titulo text-3xl font-bold">{sede.name}</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{sede.code}</p>
          <dl className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="font-medium text-slate-700 dark:text-slate-300">Ciudad</dt>
              <dd className="mt-1 text-slate-600 dark:text-slate-400">{sede.city}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700 dark:text-slate-300">Dirección</dt>
              <dd className="mt-1 text-slate-600 dark:text-slate-400">{sede.address}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700 dark:text-slate-300">Capacidad</dt>
              <dd className="mt-1 text-slate-600 dark:text-slate-400">{formatoNumero.format(sede.capacity)} personas</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700 dark:text-slate-300">Estado</dt>
              <dd className="mt-1 text-slate-600 dark:text-slate-400">{sede.active ? 'Activa' : 'Inactiva'}</dd>
            </div>
          </dl>
        </article>
      )}
    </main>
  )
}
