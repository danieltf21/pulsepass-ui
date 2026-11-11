import { Link, useParams } from 'react-router'
import { z } from 'zod'
import { ApiError } from '../../api/http'
import type { CategoriaEvento, EstadoEvento } from '../../api/eventos.tipos'
import { useEvento } from '../../hooks/useEventos'

const parametrosSchema = z.object({ eventCode: z.string().trim().min(1).max(50) })
const categorias: Record<CategoriaEvento, string> = {
  MUSIC: 'Música',
  SPORTS: 'Deportes',
  TECHNOLOGY: 'Tecnología',
  EDUCATION: 'Educación',
  CULTURE: 'Cultura',
  ENTERTAINMENT: 'Entretenimiento',
}
const estados: Record<EstadoEvento, string> = {
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

export default function DetalleEvento() {
  const parametros = parametrosSchema.safeParse(useParams())
  const codigo = parametros.success ? parametros.data.eventCode : ''
  const { data: evento, isPending, isError, error, isFetching, refetch } = useEvento(codigo)
  const noDisponible = !parametros.success
    || (isError && error instanceof ApiError && (error.status === 403 || error.status === 404))

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 font-cuerpo text-slate-900 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link to="/" className="rounded text-marca-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600">
          Volver al catálogo
        </Link>

        {noDisponible ? (
          <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
            <h1 className="font-titulo text-2xl font-bold">Evento no disponible</h1>
            <p className="mt-3 text-slate-600">El evento no existe o no está disponible para consultar.</p>
          </section>
        ) : isPending ? (
          <p role="status" className="mt-8 text-slate-600">Cargando evento…</p>
        ) : isError ? (
          <section role="alert" className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6">
            <h1 className="font-titulo text-2xl font-bold">No se pudo cargar el evento</h1>
            <p className="mt-3 text-red-800">
              {error instanceof ApiError ? error.message : 'La información recibida no tiene el formato esperado.'}
            </p>
            <button
              type="button"
              disabled={isFetching}
              onClick={() => void refetch()}
              className="mt-4 rounded-lg bg-marca-600 px-4 py-2 text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:cursor-wait disabled:opacity-60"
            >
              {isFetching ? 'Reintentando…' : 'Reintentar'}
            </button>
          </section>
        ) : (
          <article className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap gap-2 text-sm font-medium">
              <span className="rounded-full bg-marca-50 px-3 py-1 text-marca-700">{categorias[evento.category]}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{estados[evento.status]}</span>
            </div>
            <h1 className="mt-5 font-titulo text-3xl font-bold">{evento.name}</h1>
            <p className="mt-2 text-sm text-slate-500">{evento.eventCode}</p>
            <p className="mt-6 whitespace-pre-line leading-relaxed text-slate-600">
              {evento.description?.trim() || 'Este evento aún no tiene descripción.'}
            </p>

            <dl className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="font-semibold">Fecha y hora</dt>
                <dd className="mt-1 text-slate-600">
                  <time dateTime={evento.eventDate}>{formatoFecha.format(new Date(evento.eventDate))}</time>
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Edad mínima</dt>
                <dd className="mt-1 text-slate-600">{evento.minimumAge} años</dd>
              </div>
              <div>
                <dt className="font-semibold">Sede</dt>
                <dd className="mt-1 text-slate-600">{evento.venueName} ({evento.venueCode})</dd>
              </div>
            </dl>

            <section aria-labelledby="titulo-artistas" className="mt-8 border-t border-slate-200 pt-6">
              <h2 id="titulo-artistas" className="font-titulo text-xl font-bold">Artistas</h2>
              {evento.artists.length === 0 ? (
                <p className="mt-3 text-slate-600">Aún no hay artistas anunciados.</p>
              ) : (
                <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                  {evento.artists.map((artista) => (
                    <li key={artista.id} className="rounded-lg bg-slate-50 p-4">
                      <h3 className="font-semibold">{artista.stageName}</h3>
                      {artista.genre && <p className="mt-1 text-sm text-slate-600">{artista.genre}</p>}
                      {artista.country && <p className="mt-1 text-sm text-slate-600">{artista.country}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </article>
        )}
      </div>
    </main>
  )
}
