import { categoriaEventoSchema, type CategoriaEvento } from '../../api/eventos.tipos'
import { etiquetasCategoria } from '../../lib/categoriasEvento'

interface FiltrosEventosProps {
  busqueda: string
  categoria: CategoriaEvento | ''
  onBusquedaChange: (valor: string) => void
  onCategoriaChange: (valor: CategoriaEvento | '') => void
}

export default function FiltrosEventos({ busqueda, categoria, onBusquedaChange, onCategoriaChange }: FiltrosEventosProps) {
  return (
    <div role="search" aria-label="Filtrar eventos" className="mt-6">
      <label htmlFor="busqueda-eventos" className="block text-sm font-medium text-slate-700">
        Buscar por nombre del evento
      </label>
      <div className="mt-2 flex flex-wrap gap-3">
        <input
          id="busqueda-eventos"
          type="search"
          value={busqueda}
          maxLength={200}
          onChange={(event) => onBusquedaChange(event.target.value)}
          placeholder="Escribe el nombre de un evento"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
        />
        {busqueda && (
          <button
            type="button"
            onClick={() => onBusquedaChange('')}
            className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
          >
            Limpiar búsqueda
          </button>
        )}
      </div>
      <div className="mt-4">
        <label htmlFor="categoria-eventos" className="block text-sm font-medium text-slate-700">Categoría</label>
        <select
          id="categoria-eventos"
          value={categoria}
          onChange={(event) => {
            const seleccion = categoriaEventoSchema.safeParse(event.target.value)
            onCategoriaChange(seleccion.success ? seleccion.data : '')
          }}
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 sm:max-w-xs"
        >
          <option value="">Todas las categorías</option>
          {categoriaEventoSchema.options.map((valor) => <option key={valor} value={valor}>{etiquetasCategoria[valor]}</option>)}
        </select>
      </div>
    </div>
  )
}
