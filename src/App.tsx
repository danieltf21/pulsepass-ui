import { useEventos } from './hooks/useEventos'
import type { EstadoEvento } from './api/eventos.tipos'

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

export default function App() {
  const { data: eventos, isPending, isError, isFetching, refetch } = useEventos()

  return (
    <div className="min-h-screen bg-slate-50 font-cuerpo text-slate-900">
      <header className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-6xl text-2xl font-bold text-marca-600">
          PulsePass
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="font-titulo text-3xl font-bold">Cartelera de eventos</h1>
        <p className="mt-3 text-slate-600">Descubre tu próxima experiencia.</p>

        <section aria-label="Eventos publicados" aria-busy={isFetching} className="mt-8">
          {isPending && (
            <p role="status" className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
              Cargando eventos…
            </p>
          )}

          {isError && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6">
              <p className="text-red-800">No se pudieron cargar los eventos publicados.</p>
              <button
                type="button"
                disabled={isFetching}
                onClick={() => void refetch()}
                className="mt-4 rounded-lg bg-marca-600 px-4 py-2 font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:cursor-wait disabled:opacity-60"
              >
                {isFetching ? 'Reintentando…' : 'Reintentar'}
              </button>
            </div>
          )}

          {!isPending && !isError && eventos.length === 0 && (
            <p role="status" className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
              Aún no hay eventos publicados. Vuelve pronto para descubrir novedades.
            </p>
          )}

          {!isPending && !isError && eventos.length > 0 && (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {eventos.map((evento) => (
                <li key={evento.eventCode}>
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
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
