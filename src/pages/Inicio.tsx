import EstadoCarga from '../components/ui/EstadoCarga'
import { Link } from 'react-router'
import TarjetaEvento from '../components/eventos/TarjetaEvento'
import TarjetaArtista from '../components/artistas/TarjetaArtista'
import { useArtistasActivos } from '../hooks/useArtistas'
import { useAuth } from '../hooks/useAuth'
import { useEventos } from '../hooks/useEventos'
import { RUTAS } from '../lib/rutas'

export default function Inicio() {
  const { sesion } = useAuth()
  const { data: eventos, isPending, isError, isFetching, refetch } = useEventos()
  const artistas = useArtistasActivos()

  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <section className="rounded-2xl bg-[linear-gradient(90deg,var(--color-marca-700)_0%,var(--color-marca-600)_40%,#7c3aed_72%,#be185d_100%)] text-white">
          <div className="px-5 py-5 sm:px-12 sm:py-16">
            <h1 className="max-w-lg font-titulo text-3xl text-balance font-bold tracking-tight sm:text-5xl">
              Descubre los mejores eventos
            </h1>
            <p className="mt-2 max-w-xl text-base leading-snug sm:mt-3 sm:text-lg sm:leading-relaxed">
              Música, cultura, deporte y tecnología en un solo lugar.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 sm:mt-5 sm:gap-3">
              <Link
                to={RUTAS.eventos}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-marca-700 hover:bg-marca-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:px-5 sm:py-3 sm:text-base"
              >
                Ver cartelera
              </Link>
              {sesion.estado === 'anonima' && (
                <Link
                  to={RUTAS.registro}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white bg-slate-950/40 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-950/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:px-5 sm:py-3 sm:text-base"
                >
                  Crear cuenta
                </Link>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-10">
        <section aria-labelledby="proximos-eventos" aria-busy={isFetching} className="pt-6 sm:pt-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 id="proximos-eventos" className="font-titulo text-2xl font-bold">Próximos eventos</h2>
            <Link
              to={RUTAS.eventos}
              className="rounded py-2 font-medium text-marca-700 dark:text-indigo-300 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
            >
              Ver todos los eventos
            </Link>
          </div>

          {isPending ? (
            <div className="mt-6" role="status">
              <p className="sr-only">Cargando eventos…</p>
              <div aria-hidden="true" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((numero) => (
                  <div key={numero} className="h-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 motion-safe:animate-pulse" />
                ))}
              </div>
            </div>
          ) : isError ? (
            <div role="alert" className="mt-6 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6">
              <p className="text-red-800 dark:text-red-200">No se pudieron cargar los próximos eventos.</p>
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
            <p role="status" className="mt-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-slate-600 dark:text-slate-400">
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
        <section aria-labelledby="artistas-destacados" aria-busy={artistas.isFetching} className="pt-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 id="artistas-destacados" className="font-titulo text-2xl font-bold">Artistas destacados</h2>
            <Link
              to={RUTAS.artistas}
              className="rounded py-2 font-medium text-marca-700 dark:text-indigo-300 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
            >
              Ver todos los artistas
            </Link>
          </div>
          {artistas.isPending ? (
            <EstadoCarga className="mt-6">Cargando artistas…</EstadoCarga>
          ) : artistas.isError ? (
            <div role="alert" className="mt-6 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6">
              <p className="text-red-800 dark:text-red-200">No se pudieron cargar los artistas destacados.</p>
              <button
                type="button"
                disabled={artistas.isFetching}
                onClick={() => void artistas.refetch()}
                className="mt-4 rounded-lg bg-marca-600 px-4 py-3 text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:opacity-60"
              >
                {artistas.isFetching ? 'Reintentando artistas…' : 'Reintentar artistas'}
              </button>
            </div>
          ) : artistas.data.length === 0 ? (
            <p role="status" className="mt-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-slate-600 dark:text-slate-400">
              Aún no hay artistas destacados.
            </p>
          ) : (
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {artistas.data.slice(0, 6).map((artista) => (
                <li key={artista.id}><TarjetaArtista artista={artista} /></li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
