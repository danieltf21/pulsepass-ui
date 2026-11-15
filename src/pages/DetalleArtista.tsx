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
        className="rounded text-marca-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
      >
        Volver a artistas
      </Link>

      {consulta.isPending ? (
        <p role="status" className="mt-8 text-slate-600">Cargando artista…</p>
      ) : consulta.isError ? (
        <section role="alert" className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6">
          <h1 className="font-titulo text-2xl font-bold">No se pudo cargar el artista</h1>
          <button
            type="button"
            disabled={consulta.isFetching}
            onClick={() => void consulta.refetch()}
            className="mt-4 rounded-lg bg-marca-600 px-4 py-3 text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:opacity-60"
          >
            {consulta.isFetching ? 'Reintentando…' : 'Reintentar'}
          </button>
        </section>
      ) : (
        <>
          <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
            <h1 className="font-titulo text-3xl font-bold">{consulta.data.stageName}</h1>
            <dl className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="font-medium text-slate-700">Género</dt>
                <dd className="mt-1 text-slate-600">{consulta.data.genre || 'No informado'}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-700">País</dt>
                <dd className="mt-1 text-slate-600">{consulta.data.country || 'No informado'}</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="eventos-artista" aria-busy={eventos.isFetching} className="mt-10">
            <h2 id="eventos-artista" className="font-titulo text-2xl font-bold">Eventos del artista</h2>
            {eventos.isPending ? (
              <p role="status" className="mt-4 text-slate-600">Cargando eventos…</p>
            ) : eventos.isError ? (
              <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-6">
                <p className="text-red-800">No se pudieron cargar los eventos del artista.</p>
                <button
                  type="button"
                  disabled={eventos.isFetching}
                  onClick={() => void eventos.refetch()}
                  className="mt-4 rounded-lg bg-marca-600 px-4 py-3 text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:opacity-60"
                >
                  {eventos.isFetching ? 'Reintentando…' : 'Reintentar'}
                </button>
              </div>
            ) : eventos.data.length === 0 ? (
              <p role="status" className="mt-4 rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
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
