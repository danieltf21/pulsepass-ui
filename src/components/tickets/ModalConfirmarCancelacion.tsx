import { useRef } from 'react'
import { ApiError } from '../../api/http'
import type { Ticket } from '../../api/tickets.tipos'
import { useCancelarTicket } from '../../hooks/useTickets'
import Modal from '../ui/Modal'

interface ModalConfirmarCancelacionProps {
  ticketCode: string
  onCerrar: () => void
  onCancelado: (ticket: Ticket) => void
}

export default function ModalConfirmarCancelacion({ ticketCode, onCerrar, onCancelado }: ModalConfirmarCancelacionProps) {
  const cancelacion = useCancelarTicket(ticketCode)
  const enviando = useRef(false)

  function cerrar() {
    if (enviando.current) return
    onCerrar()
  }

  async function confirmar() {
    if (enviando.current) return
    enviando.current = true
    try {
      const ticket = await cancelacion.mutateAsync()
      onCancelado(ticket)
    } catch {
      // Mantiene el diálogo abierto y muestra el error de la mutación.
    } finally {
      enviando.current = false
    }
  }

  return (
    <Modal abierto titulo="Cancelar entrada" onCerrar={cerrar} bloqueado={cancelacion.isPending}>
      <p className="text-slate-700">¿Confirmas que quieres cancelar la entrada <span className="break-all font-mono">{ticketCode}</span>?</p>
      <p className="mt-3 text-sm text-slate-600">La entrada cancelada ya no podrá utilizarse para ingresar al evento.</p>
      {cancelacion.isError && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 p-4 text-red-800">
          {cancelacion.error instanceof ApiError ? cancelacion.error.message : 'No se pudo cancelar la entrada. Inténtalo de nuevo.'}
        </p>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={cancelacion.isPending}
          onClick={() => void confirmar()}
          className="rounded-lg bg-red-700 px-4 py-3 font-medium text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-wait disabled:opacity-60"
        >
          {cancelacion.isPending ? 'Cancelando…' : 'Confirmar cancelación'}
        </button>
        <button
          type="button"
          disabled={cancelacion.isPending}
          onClick={cerrar}
          className="rounded-lg border border-slate-300 px-4 py-3 text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:opacity-60"
        >
          Conservar entrada
        </button>
      </div>
    </Modal>
  )
}
