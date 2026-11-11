import { useEventos } from '../hooks/useEventos'
import TarjetaEvento from '../components/eventos/TarjetaEvento'
import FiltrosEventos from '../components/eventos/FiltrosEventos'
import { useSearchParams } from 'react-router'
import { z } from 'zod'

const filtrosSchema = z.object({ q: z.string().max(200).catch('') })

function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-CO')
}

export default function CatalogoEventos() {
  const { data: eventos, isPending, isError, isFetching, refetch } = useEventos()
  const [parametros, setParametros] = useSearchParams()
  const { q: busqueda } = filtrosSchema.parse({ q: parametros.get('q') ?? '' })
  const eventosFiltrados = eventos?.filter((evento) =>
    normalizar(evento.name).includes(normalizar(busqueda.trim())),
  ) ?? []

  function cambiarBusqueda(valor: string) {
    setParametros((actuales) => {
      const siguientes = new URLSearchParams(actuales)
      if (valor) siguientes.set('q', valor)
      else siguientes.delete('q')
      return siguientes
    }, { replace: true })
  }

  return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="font-titulo text-3xl font-bold">Cartelera de eventos</h1>
        <p className="mt-3 text-slate-600">Descubre tu próxima experiencia.</p>

        <FiltrosEventos busqueda={busqueda} onBusquedaChange={cambiarBusqueda} />

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
            <p role="status" className="mb-4 text-sm text-slate-600">
              {eventosFiltrados.length === 0
                ? 'No hay eventos que coincidan con tu búsqueda.'
                : `${eventosFiltrados.length} resultado${eventosFiltrados.length === 1 ? '' : 's'}`}
            </p>
          )}

          {!isPending && !isError && eventosFiltrados.length > 0 && (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {eventosFiltrados.map((evento) => (
                <li key={evento.eventCode}>
                  <TarjetaEvento evento={evento} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
  )
}
