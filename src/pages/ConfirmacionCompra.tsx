import { Link, useParams } from 'react-router'
import { z } from 'zod'
import { ApiError } from '../api/http'
import type { EstadoTicket, TipoTicket } from '../api/tickets.tipos'
import PrecioCOP from '../components/ui/PrecioCOP'
import { useTicket } from '../hooks/useTickets'
import { formatearFecha } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

const codigoSchema = z.string().trim().min(1)
const tipos: Record<TipoTicket, string> = {
  GENERAL: 'General', VIP: 'VIP', BACKSTAGE: 'Backstage', STUDENT: 'Estudiante',
}
const estados: Record<EstadoTicket, string> = {
  RESERVED: 'Reservado', PAID: 'Pagado', CANCELLED: 'Cancelado', USED: 'Usado',
}

export default function ConfirmacionCompra() {
  const parametros = useParams()
  const codigo = codigoSchema.safeParse(parametros.ticketCode)
  const { data: ticket, isPending, isError, error, isFetching, refetch } = useTicket(codigo.success ? codigo.data : '')
  const noDisponible = !codigo.success
    || (error instanceof ApiError && (error.status === 403 || error.status === 404))

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {noDisponible ? (
        <section>
          <h1 className="font-titulo text-3xl font-bold">Ticket no disponible</h1>
          <p className="mt-4 text-slate-600">La entrada no existe o no está disponible para tu cuenta.</p>
          <Link to={RUTAS.eventos} className="mt-6 inline-block rounded text-marca-700 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600">
            Volver a eventos
          </Link>
        </section>
      ) : isPending ? (
        <p role="status" className="text-slate-600">Cargando confirmación…</p>
      ) : isError ? (
        <section role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h1 className="font-titulo text-2xl font-bold">No se pudo cargar la confirmación</h1>
          <p className="mt-3 text-red-800">{error instanceof ApiError ? error.message : 'Inténtalo de nuevo.'}</p>
          <button
            type="button"
            disabled={isFetching}
            onClick={() => void refetch()}
            className="mt-4 rounded-lg bg-marca-600 px-4 py-3 text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:opacity-60"
          >
            {isFetching ? 'Reintentando…' : 'Reintentar'}
          </button>
        </section>
      ) : (
        <>
          <h1 className="font-titulo text-3xl font-bold">{ticket.status === 'PAID' ? 'Compra confirmada' : 'Detalle de tu compra'}</h1>
          <p className="mt-3 text-slate-600">Conserva el código de tu entrada.</p>
          <dl className="mt-8 grid gap-6 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2 sm:p-8">
            <div>
              <dt className="font-medium text-slate-700">Código del ticket</dt>
              <dd className="mt-1 break-all font-mono text-slate-900">{ticket.ticketCode}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700">Evento</dt>
              <dd className="mt-1 text-slate-600">{ticket.eventName}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700">Tipo de entrada</dt>
              <dd className="mt-1 text-slate-600">{tipos[ticket.type]}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700">Precio</dt>
              <dd className="mt-1 text-slate-600"><PrecioCOP valor={ticket.price} /></dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700">Estado</dt>
              <dd className="mt-1 text-slate-600">{estados[ticket.status]}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700">Fecha de compra</dt>
              <dd className="mt-1 text-slate-600"><time dateTime={ticket.purchaseDate}>{formatearFecha(ticket.purchaseDate)}</time></dd>
            </div>
          </dl>
          <Link
            to={RUTAS.evento(ticket.eventCode)}
            className="mt-6 inline-flex rounded-lg bg-marca-600 px-4 py-3 text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
          >
            Volver al evento
          </Link>
        </>
      )}
    </main>
  )
}
