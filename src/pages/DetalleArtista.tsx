import BotonReintentar from '../components/ui/BotonReintentar'
import EstadoCarga from '../components/ui/EstadoCarga'
import { Link, useParams } from 'react-router'
import { z } from 'zod'
import { ApiError } from '../api/http'
import TarjetaEvento from '../components/eventos/TarjetaEvento'
import { useArtista } from '../hooks/useArtistas'
import { useEventosPorArtista } from '../hooks/useEventos'
import { RUTAS } from '../lib/rutas'
import NoEncontrada from './NoEncontrada'

const idSchema = z.string().regex(/^\d+$/).transform(Number)
  .pipe(z.number().int().positive().max(Number.MAX_SAFE_INTEGER))

export default function DetalleArtista() {
  const parametros = useParams()
  const id = idSchema.safeParse(parametros.id)
  const consulta = useArtista(id.success ? id.data : 0)
  const eventos = useEventosPorArtista(consulta.data?.stageName ?? '')

  if (!id.success || (consulta.error instanceof ApiError && consulta.error.status === 404)) {
    return <NoEncontrada />
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        to={RUTAS.artistas}
        className="rounded text-marca-700 dark:text-indigo-300 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
      >
        Volver a artistas
      </Link>

      {consulta.isPending ? (
        <EstadoCarga className="mt-8">Cargando artista…</EstadoCarga>
      ) : consulta.isError ? (
        <section role="alert" className="mt-8 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6">
          <h1 className="font-titulo text-2xl font-bold">No se pudo cargar el artista</h1>
          <BotonReintentar enCurso={consulta.isFetching} onReintentar={() => void consulta.refetch()} />
        </section>
      ) : (
        <>
          <section className="mt-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 sm:p-8">
            <h1 className="font-titulo text-3xl font-bold">{consulta.data.stageName}</h1>
            <dl className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="font-medium text-slate-700 dark:text-slate-300">Género</dt>
                <dd className="mt-1 text-slate-600 dark:text-slate-400">{consulta.data.genre || 'No informado'}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-700 dark:text-slate-300">País</dt>
                <dd className="mt-1 text-slate-600 dark:text-slate-400">{consulta.data.country || 'No informado'}</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="eventos-artista" aria-busy={eventos.isFetching} className="mt-10">
            <h2 id="eventos-artista" className="font-titulo text-2xl font-bold">Eventos del artista</h2>
            {eventos.isPending ? (
              <EstadoCarga className="mt-4">Cargando eventos…</EstadoCarga>
            ) : eventos.isError ? (
              <div role="alert" className="mt-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6">
                <p className="text-red-800 dark:text-red-200">No se pudieron cargar los eventos del artista.</p>
                <BotonReintentar enCurso={eventos.isFetching} onReintentar={() => void eventos.refetch()} />
              </div>
            ) : eventos.data.length === 0 ? (
              <p role="status" className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-slate-600 dark:text-slate-400">
                No hay eventos disponibles para este artista.
              </p>
            ) : (
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {eventos.data.map((evento) => (
                  <li key={evento.eventCode}><TarjetaEvento evento={evento} /></li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  )
}
