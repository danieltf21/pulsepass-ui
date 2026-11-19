import EstadoError from '../components/ui/EstadoError'
import EstadoVacio from '../components/ui/EstadoVacio'
import TarjetaArtista from '../components/artistas/TarjetaArtista'
import BuscadorArtista from '../components/artistas/BuscadorArtista'
import { useArtistaPorNombre, useArtistasActivos } from '../hooks/useArtistas'
import { useState } from 'react'
import { ApiError } from '../api/http'

export default function ListaArtistas() {
  const [nombreBuscado, setNombreBuscado] = useState('')
  const listado = useArtistasActivos()
  const busqueda = useArtistaPorNombre(nombreBuscado)
  const consulta = nombreBuscado ? busqueda : listado
  const { isPending, isError, isFetching, refetch } = consulta
  const artistas = nombreBuscado
    ? (busqueda.data ? [busqueda.data] : [])
    : (listado.data ?? [])
  const noEncontrado = Boolean(nombreBuscado)
    && busqueda.error instanceof ApiError && busqueda.error.status === 404

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-titulo text-3xl font-bold">Artistas</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-400">Conoce a los artistas de PulsePass.</p>
      <BuscadorArtista onBuscar={setNombreBuscado} onLimpiar={() => setNombreBuscado('')} />
      {nombreBuscado && (
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Búsqueda: <strong>{nombreBuscado}</strong></p>
      )}

      <section aria-label="Resultados de artistas" aria-busy={isFetching} className="mt-8">
        {isPending ? (
          <div role="status">
            <p className="sr-only">Cargando artistas…</p>
            <div aria-hidden="true" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((numero) => (
                <div key={numero} className="h-72 rounded-xl bg-slate-200 dark:bg-slate-800 motion-safe:animate-pulse" />
              ))}
            </div>
          </div>
        ) : noEncontrado ? (
          <EstadoVacio>No se encontró un artista con ese nombre artístico.</EstadoVacio>
        ) : isError ? (
          <EstadoError titulo="No se pudieron cargar los artistas" mensaje="Inténtalo de nuevo en unos momentos.">
            <button
              type="button"
              disabled={isFetching}
              onClick={() => void refetch()}
              className="mt-4 rounded-lg bg-marca-600 px-4 py-3 font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:cursor-wait disabled:opacity-60"
            >
              {isFetching ? 'Reintentando…' : 'Reintentar'}
            </button>
          </EstadoError>
        ) : artistas.length === 0 ? (
          <EstadoVacio>Aún no hay artistas activos.</EstadoVacio>
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
