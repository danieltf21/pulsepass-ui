interface FiltrosEventosProps {
  busqueda: string
  onBusquedaChange: (valor: string) => void
}

export default function FiltrosEventos({ busqueda, onBusquedaChange }: FiltrosEventosProps) {
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
    </div>
  )
}
