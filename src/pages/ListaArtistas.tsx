import TarjetaArtista from '../components/artistas/TarjetaArtista'
import { useArtistasActivos } from '../hooks/useArtistas'

export default function ListaArtistas() {
  const { data: artistas, isPending, isError, isFetching, refetch } = useArtistasActivos()

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-titulo text-3xl font-bold">Artistas</h1>
      <p className="mt-3 text-slate-600">Conoce a los artistas de PulsePass.</p>

      <section aria-label="Artistas activos" aria-busy={isFetching} className="mt-8">
        {isPending ? (
          <div role="status">
            <p className="sr-only">Cargando artistas…</p>
            <div aria-hidden="true" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((numero) => (
                <div key={numero} className="h-72 rounded-xl bg-slate-200 motion-safe:animate-pulse" />
              ))}
            </div>
          </div>
        ) : isError ? (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-900">No se pudieron cargar los artistas</h2>
            <p className="mt-2 text-red-800">Inténtalo de nuevo en unos momentos.</p>
            <button
              type="button"
              disabled={isFetching}
              onClick={() => void refetch()}
              className="mt-4 rounded-lg bg-marca-600 px-4 py-3 font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:cursor-wait disabled:opacity-60"
            >
              {isFetching ? 'Reintentando…' : 'Reintentar'}
            </button>
          </div>
        ) : artistas.length === 0 ? (
          <p role="status" className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
            Aún no hay artistas activos.
          </p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {artistas.map((artista) => (
              <li key={artista.id}><TarjetaArtista artista={artista} /></li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
