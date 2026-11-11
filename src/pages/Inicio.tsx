import { Link } from 'react-router'
import TarjetaEvento from '../components/eventos/TarjetaEvento'
import { useEventos } from '../hooks/useEventos'
import { RUTAS } from '../lib/rutas'

export default function Inicio() {
  const { data: eventos, isPending, isError, isFetching, refetch } = useEventos()

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <section className="rounded-2xl bg-linear-to-br from-marca-600 to-acento-500 px-6 py-12 text-white sm:px-12 sm:py-16">
        <h1 className="max-w-2xl font-titulo text-4xl font-bold tracking-tight sm:text-5xl">
          Descubre los mejores eventos
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed">
          Música, cultura, deporte y tecnología en un solo lugar.
        </p>
        <Link
          to={RUTAS.eventos}
          className="mt-8 inline-flex rounded-lg bg-white px-5 py-3 font-semibold text-marca-700 hover:bg-marca-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          Ver cartelera
        </Link>
      </section>

      <section aria-labelledby="proximos-eventos" aria-busy={isFetching} className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="proximos-eventos" className="font-titulo text-2xl font-bold">Próximos eventos</h2>
          <Link
            to={RUTAS.eventos}
            className="rounded py-2 font-medium text-marca-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
          >
            Ver todos los eventos
          </Link>
        </div>

        {isPending ? (
          <div className="mt-6" role="status">
            <p className="sr-only">Cargando eventos…</p>
            <div aria-hidden="true" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((numero) => (
                <div key={numero} className="h-64 rounded-xl border border-slate-200 bg-slate-200 motion-safe:animate-pulse" />
              ))}
            </div>
          </div>
        ) : isError ? (
          <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6">
            <p className="text-red-800">No se pudieron cargar los próximos eventos.</p>
            <button
              type="button"
              disabled={isFetching}
              onClick={() => void refetch()}
              className="mt-4 rounded-lg bg-marca-600 px-4 py-3 font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:cursor-wait disabled:opacity-60"
            >
              {isFetching ? 'Reintentando…' : 'Reintentar'}
            </button>
          </div>
        ) : eventos.length === 0 ? (
          <p role="status" className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
            Aún no hay eventos publicados.
          </p>
        ) : (
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {eventos.slice(0, 3).map((evento) => (
              <li key={evento.eventCode}><TarjetaEvento evento={evento} /></li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
