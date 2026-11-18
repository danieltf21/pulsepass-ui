import TarjetaSede from '../components/sedes/TarjetaSede'
import { useSedesActivas } from '../hooks/useSedes'

export default function ListaSedes() {
  const { data: sedes, isPending, isError, isFetching, refetch } = useSedesActivas()

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-titulo text-3xl font-bold">Sedes</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-400">Conoce los lugares donde se viven los eventos de PulsePass.</p>

      <section aria-label="Sedes activas" aria-busy={isFetching} className="mt-8">
        {isPending ? (
          <div role="status">
            <p className="sr-only">Cargando sedes…</p>
            <div aria-hidden="true" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((numero) => (
                <div key={numero} className="h-64 rounded-xl bg-slate-200 dark:bg-slate-800 motion-safe:animate-pulse" />
              ))}
            </div>
          </div>
        ) : isError ? (
          <div role="alert" className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6">
            <h2 className="text-lg font-semibold text-red-900 dark:text-red-200">No se pudieron cargar las sedes</h2>
            <p className="mt-2 text-red-800 dark:text-red-200">Inténtalo de nuevo en unos momentos.</p>
            <button
              type="button"
              disabled={isFetching}
              onClick={() => void refetch()}
              className="mt-4 rounded-lg bg-marca-600 px-4 py-3 font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:cursor-wait disabled:opacity-60"
            >
              {isFetching ? 'Reintentando…' : 'Reintentar'}
            </button>
          </div>
        ) : sedes.length === 0 ? (
          <p role="status" className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-slate-600 dark:text-slate-400">
            Aún no hay sedes activas.
          </p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sedes.map((sede) => (
              <li key={sede.code}><TarjetaSede sede={sede} /></li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
