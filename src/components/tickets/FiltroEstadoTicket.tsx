import type { EstadoTicket } from '../../api/tickets.tipos'

type FiltroTicket = 'TODOS' | Extract<EstadoTicket, 'PAID' | 'USED' | 'CANCELLED'>

interface FiltroEstadoTicketProps {
  valor: FiltroTicket
  onCambiar: (valor: FiltroTicket) => void
}

const opciones: { valor: FiltroTicket; etiqueta: string }[] = [
  { valor: 'TODOS', etiqueta: 'Todos' },
  { valor: 'PAID', etiqueta: 'Pagados' },
  { valor: 'USED', etiqueta: 'Usados' },
  { valor: 'CANCELLED', etiqueta: 'Cancelados' },
]

export default function FiltroEstadoTicket({ valor, onCambiar }: FiltroEstadoTicketProps) {
  return (
    <div role="group" aria-label="Filtrar entradas por estado" className="flex flex-wrap gap-2">
      {opciones.map((opcion) => (
        <button
          key={opcion.valor}
          type="button"
          aria-pressed={valor === opcion.valor}
          onClick={() => onCambiar(opcion.valor)}
          className={`min-h-11 rounded-full border px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 ${valor === opcion.valor ? 'border-marca-600 bg-marca-600 text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          {opcion.etiqueta}
        </button>
      ))}
    </div>
  )
}
