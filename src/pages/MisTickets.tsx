import Badge from '../components/ui/Badge'
import EstadoCarga from '../components/ui/EstadoCarga'
import { useState } from 'react'
import { Link } from 'react-router'
import { ApiError } from '../api/http'
import type { EstadoTicket, TipoTicket } from '../api/tickets.tipos'
import PrecioCOP from '../components/ui/PrecioCOP'
import FiltroEstadoTicket from '../components/tickets/FiltroEstadoTicket'
import ModalConfirmarCancelacion from '../components/tickets/ModalConfirmarCancelacion'
import { useMisTickets } from '../hooks/useTickets'
import { formatearFecha } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

const tipos: Record<TipoTicket, string> = {
  GENERAL: 'General', VIP: 'VIP', BACKSTAGE: 'Backstage', STUDENT: 'Estudiante',
}
const estados: Record<EstadoTicket, string> = {
  RESERVED: 'Reservado', PAID: 'Pagado', CANCELLED: 'Cancelado', USED: 'Usado',
}

export default function MisTickets() {
  const [filtro, setFiltro] = useState<'TODOS' | 'PAID' | 'USED' | 'CANCELLED'>('TODOS')
  const [ticketACancelar, setTicketACancelar] = useState<string | null>(null)
  const [cancelada, setCancelada] = useState(false)
  const { data: tickets, isPending, isError, error, isFetching, refetch } = useMisTickets()
  const ticketsVisibles = tickets?.filter((ticket) => filtro === 'TODOS' || ticket.status === filtro) ?? []

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-titulo text-3xl font-bold">Mis tickets</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-400">Consulta las entradas que has comprado en PulsePass.</p>

      <div className="mt-6">
        <FiltroEstadoTicket valor={filtro} onCambiar={setFiltro} />
      </div>
      {cancelada && <p role="status" aria-live="off" className="mt-6 rounded-lg bg-green-50 dark:bg-green-950 p-4 text-green-800 dark:text-green-200">La entrada se canceló correctamente.</p>}

      <section aria-label="Tus entradas" aria-busy={isFetching} className="mt-8">
        {isPending ? (
          <EstadoCarga>Cargando tus entradas…</EstadoCarga>
        ) : isError ? (
          <div role="alert" className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6">
            <h2 className="text-lg font-semibold text-red-900 dark:text-red-200">No se pudieron cargar tus entradas</h2>
            <p className="mt-2 text-red-800 dark:text-red-200">
              {error instanceof ApiError ? error.message : 'Inténtalo de nuevo en unos momentos.'}
            </p>
            <button
              type="button"
              disabled={isFetching}
              onClick={() => void refetch()}
              className="mt-4 rounded-lg bg-marca-600 px-4 py-3 font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:cursor-wait disabled:opacity-60"
            >
              {isFetching ? 'Reintentando…' : 'Reintentar'}
            </button>
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
            <p role="status" className="text-slate-600 dark:text-slate-400">Aún no tienes entradas.</p>
            <Link to={RUTAS.eventos} className="mt-4 inline-block rounded text-marca-700 dark:text-indigo-300 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600">
              Explorar eventos
            </Link>
          </div>
        ) : ticketsVisibles.length === 0 ? (
          <p role="status" className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-slate-600 dark:text-slate-400">
            No tienes entradas con el estado seleccionado.
          </p>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2">
            {ticketsVisibles.map((ticket) => (
              <li key={ticket.ticketCode} className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <h2 className="font-titulo text-xl font-bold">{ticket.eventName}</h2>
                <p className="mt-2 break-all font-mono text-sm text-slate-600 dark:text-slate-400">{ticket.ticketCode}</p>
                <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="font-medium">Tipo de entrada</dt>
                    <dd className="mt-1 text-slate-600 dark:text-slate-400">{tipos[ticket.type]}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Estado</dt>
                    <dd className="mt-1"><Badge variante={ticket.status}>{estados[ticket.status]}</Badge></dd>
                  </div>
                  <div>
                    <dt className="font-medium">Precio</dt>
                    <dd className="mt-1 text-slate-600 dark:text-slate-400"><PrecioCOP valor={ticket.price} /></dd>
                  </div>
                  <div>
                    <dt className="font-medium">Fecha de compra</dt>
                    <dd className="mt-1 text-slate-600 dark:text-slate-400">
                      <time dateTime={ticket.purchaseDate}>{formatearFecha(ticket.purchaseDate)}</time>
                    </dd>
                  </div>
                </dl>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Link
                    to={RUTAS.ticket(ticket.ticketCode)}
                    aria-label={`Ver entrada ${ticket.ticketCode}`}
                    className="inline-block rounded-lg bg-marca-600 px-4 py-3 font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
                  >
                    Ver entrada
                  </Link>
                  {ticket.status === 'PAID' && (
                    <button
                      type="button"
                      aria-label={`Cancelar entrada ${ticket.ticketCode}`}
                      onClick={() => {
                        setCancelada(false)
                        setTicketACancelar(ticket.ticketCode)
                      }}
                      className="rounded-lg border border-red-300 dark:border-red-700 px-4 py-3 font-medium text-red-800 dark:text-red-200 hover:bg-red-50 dark:hover:bg-red-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                    >
                      Cancelar entrada
                    </button>
                  )}
                <Link
                  to={RUTAS.evento(ticket.eventCode)}
                  aria-label={`Ver evento ${ticket.eventName}`}
                  className="inline-block rounded text-marca-700 dark:text-indigo-300 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
                >
                  Ver evento
                </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      {ticketACancelar !== null && (
        <ModalConfirmarCancelacion
          key={ticketACancelar}
          ticketCode={ticketACancelar}
          onCerrar={() => setTicketACancelar(null)}
          onCancelado={() => {
            setTicketACancelar(null)
            setCancelada(true)
          }}
        />
      )}
    </div>
  )
}
