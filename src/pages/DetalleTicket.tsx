import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { z } from 'zod'
import { ApiError } from '../api/http'
import type { EstadoTicket, TipoTicket } from '../api/tickets.tipos'
import PrecioCOP from '../components/ui/PrecioCOP'
import { useTicket } from '../hooks/useTickets'
import ModalConfirmarCancelacion from '../components/tickets/ModalConfirmarCancelacion'
import { formatearFecha } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

const codigoSchema = z.string().trim().min(1)
const tipos: Record<TipoTicket, string> = {
  GENERAL: 'General', VIP: 'VIP', BACKSTAGE: 'Backstage', STUDENT: 'Estudiante',
}
const estados: Record<EstadoTicket, string> = {
  RESERVED: 'Reservado', PAID: 'Pagado', CANCELLED: 'Cancelado', USED: 'Usado',
}

export default function DetalleTicket() {
  const { ticketCode } = useParams()
  const codigo = codigoSchema.safeParse(ticketCode)
  const [confirmando, setConfirmando] = useState(false)
  const [cancelada, setCancelada] = useState(false)
  const [copia, setCopia] = useState<{ codigo: string; estado: 'copiando' | 'copiado' | 'error' } | null>(null)
  const { data: ticket, isPending, isError, error, isFetching, refetch } = useTicket(codigo.success ? codigo.data : '')
  const noDisponible = !codigo.success
    || (error instanceof ApiError && (error.status === 403 || error.status === 404))

  async function copiarCodigo(valor: string) {
    setCopia({ codigo: valor, estado: 'copiando' })
    try {
      await navigator.clipboard.writeText(valor)
      setCopia({ codigo: valor, estado: 'copiado' })
    } catch {
      setCopia({ codigo: valor, estado: 'error' })
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link to={RUTAS.misTickets} className="rounded text-marca-700 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600">
        Volver a Mis tickets
      </Link>

      {noDisponible ? (
        <section className="mt-8">
          <h1 className="font-titulo text-3xl font-bold">Ticket no disponible</h1>
          <p className="mt-4 text-slate-600">La entrada no existe o no está disponible para tu cuenta.</p>
        </section>
      ) : isPending ? (
        <p role="status" className="mt-8 text-slate-600">Cargando entrada…</p>
      ) : isError ? (
        <section role="alert" className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6">
          <h1 className="font-titulo text-2xl font-bold">No se pudo cargar la entrada</h1>
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
        <article className="mt-8">
          <h1 className="font-titulo text-3xl font-bold">Detalle de tu entrada</h1>
          <h2 className="mt-4 font-titulo text-xl font-semibold">{ticket.eventName}</h2>
          <dl className="mt-6 grid gap-6 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2 sm:p-8">
            <div>
              <dt className="font-medium">Código del ticket</dt>
              <dd className="mt-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="break-all font-mono text-slate-600">{ticket.ticketCode}</span>
                  <button
                    type="button"
                    aria-label="Copiar código del ticket"
                    disabled={copia?.codigo === ticket.ticketCode && copia.estado === 'copiando'}
                    onClick={() => void copiarCodigo(ticket.ticketCode)}
                    className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-marca-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:opacity-60"
                  >
                    Copiar
                  </button>
                </div>
                {copia?.codigo === ticket.ticketCode && copia.estado === 'copiado' && (
                  <p role="status" className="mt-2 text-sm text-green-800">Código copiado.</p>
                )}
                {copia?.codigo === ticket.ticketCode && copia.estado === 'error' && (
                  <p role="alert" className="mt-2 text-sm text-red-800">No se pudo copiar. Selecciona el código y cópialo manualmente.</p>
                )}
              </dd>
            </div>
            <div>
              <dt className="font-medium">Estado</dt>
              <dd className="mt-1 text-slate-600">{estados[ticket.status]}</dd>
            </div>
            <div>
              <dt className="font-medium">Tipo de entrada</dt>
              <dd className="mt-1 text-slate-600">{tipos[ticket.type]}</dd>
            </div>
            <div>
              <dt className="font-medium">Precio</dt>
              <dd className="mt-1 text-slate-600"><PrecioCOP valor={ticket.price} /></dd>
            </div>
            <div>
              <dt className="font-medium">Fecha de compra</dt>
              <dd className="mt-1 text-slate-600"><time dateTime={ticket.purchaseDate}>{formatearFecha(ticket.purchaseDate)}</time></dd>
            </div>
            <div>
              <dt className="font-medium">Correo del comprador</dt>
              <dd className="mt-1 break-all text-slate-600">{ticket.userEmail}</dd>
            </div>
          </dl>
          {cancelada && <p role="status" aria-live="off" className="mt-6 rounded-lg bg-green-50 p-4 text-green-800">La entrada se canceló correctamente.</p>}
          {ticket.status === 'PAID' && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  setCancelada(false)
                  setConfirmando(true)
                }}
                className="rounded-lg border border-red-300 px-4 py-3 font-medium text-red-800 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Cancelar entrada
              </button>
            </div>
          )}
          <Link to={RUTAS.evento(ticket.eventCode)} className="mt-6 inline-block rounded text-marca-700 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600">
            Ver evento
          </Link>
        </article>
      )}
      {confirmando && codigo.success && (
        <ModalConfirmarCancelacion
          key={codigo.data}
          ticketCode={codigo.data}
          onCerrar={() => setConfirmando(false)}
          onCancelado={() => {
            setConfirmando(false)
            setCancelada(true)
          }}
        />
      )}
    </main>
  )
}
