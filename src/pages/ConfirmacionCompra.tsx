import Badge from '../components/ui/Badge'
import BotonReintentar from '../components/ui/BotonReintentar'
import EstadoCarga from '../components/ui/EstadoCarga'
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
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {noDisponible ? (
        <section>
          <h1 className="font-titulo text-3xl font-bold">Ticket no disponible</h1>
          <p className="mt-4 text-slate-600 dark:text-slate-400">La entrada no existe o no está disponible para tu cuenta.</p>
          <Link to={RUTAS.eventos} className="mt-6 inline-block rounded text-marca-700 dark:text-indigo-300 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600">
            Volver a eventos
          </Link>
        </section>
      ) : isPending ? (
        <EstadoCarga>Cargando confirmación…</EstadoCarga>
      ) : isError ? (
        <section role="alert" className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6">
          <h1 className="font-titulo text-2xl font-bold">No se pudo cargar la confirmación</h1>
          <p className="mt-3 text-red-800 dark:text-red-200">{error instanceof ApiError ? error.message : 'Inténtalo de nuevo.'}</p>
          <BotonReintentar enCurso={isFetching} onReintentar={() => void refetch()} />
        </section>
      ) : (
        <>
          <h1 className="font-titulo text-3xl font-bold">{ticket.status === 'PAID' ? 'Compra confirmada' : 'Detalle de tu compra'}</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-400">Conserva el código de tu entrada.</p>
          <dl className="mt-8 grid gap-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 sm:grid-cols-2 sm:p-8">
            <div>
              <dt className="font-medium text-slate-700 dark:text-slate-300">Código del ticket</dt>
              <dd className="mt-1 break-all font-mono text-slate-900 dark:text-slate-100">{ticket.ticketCode}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700 dark:text-slate-300">Evento</dt>
              <dd className="mt-1 text-slate-600 dark:text-slate-400">{ticket.eventName}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700 dark:text-slate-300">Tipo de entrada</dt>
              <dd className="mt-1 text-slate-600 dark:text-slate-400">{tipos[ticket.type]}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700 dark:text-slate-300">Precio</dt>
              <dd className="mt-1 text-slate-600 dark:text-slate-400"><PrecioCOP valor={ticket.price} /></dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700 dark:text-slate-300">Estado</dt>
              <dd className="mt-1"><Badge variante={ticket.status}>{estados[ticket.status]}</Badge></dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700 dark:text-slate-300">Fecha de compra</dt>
              <dd className="mt-1 text-slate-600 dark:text-slate-400"><time dateTime={ticket.purchaseDate}>{formatearFecha(ticket.purchaseDate)}</time></dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link
            to={RUTAS.misTickets}
            className="inline-flex rounded-lg bg-marca-600 px-4 py-3 text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
          >
            Ver mis tickets
          </Link>
          <Link
            to={RUTAS.evento(ticket.eventCode)}
            className="inline-flex rounded text-marca-700 dark:text-indigo-300 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
          >
            Volver al evento
          </Link>
          </div>
        </>
      )}
    </div>
  )
}
