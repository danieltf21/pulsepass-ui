import { useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ApiError } from '../../api/http'
import {
  formularioCompraSchema,
  type FormularioCompra,
  type Ticket,
  type TipoTicket,
} from '../../api/tickets.tipos'
import { useComprarTicket } from '../../hooks/useTickets'
import Modal from '../ui/Modal'

interface ModalCompraProps {
  abierto: boolean
  eventCode: string
  nombreEvento: string
  onCerrar: () => void
  onComprado: (ticket: Ticket) => void
}

const tipos: Record<TipoTicket, string> = {
  GENERAL: 'General', VIP: 'VIP', BACKSTAGE: 'Backstage', STUDENT: 'Estudiante',
}

export default function ModalCompra({ abierto, eventCode, nombreEvento, onCerrar, onComprado }: ModalCompraProps) {
  const compra = useComprarTicket(eventCode)
  const enviando = useRef(false)
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<FormularioCompra>({
    resolver: zodResolver(formularioCompraSchema),
    defaultValues: { type: 'GENERAL' },
  })
  const ocupado = isSubmitting || compra.isPending

  function cerrar() {
    if (enviando.current) return
    reset()
    compra.reset()
    onCerrar()
  }

  async function enviar(datos: FormularioCompra) {
    if (enviando.current) return
    enviando.current = true
    try {
      const ticket = await compra.mutateAsync(datos)
      onComprado(ticket)
    } catch (error: unknown) {
      setError('root', {
        message: error instanceof ApiError ? error.message : 'No se pudo completar la compra. Inténtalo de nuevo.',
      })
    } finally {
      enviando.current = false
    }
  }

  return (
    <Modal abierto={abierto} titulo="Comprar entrada" onCerrar={cerrar} bloqueado={ocupado}>
      <p className="text-slate-700">{nombreEvento}</p>
      <form noValidate onSubmit={(event) => { void handleSubmit(enviar)(event) }} aria-busy={ocupado} className="mt-6 space-y-5">
        <div>
          <label htmlFor="tipo-ticket" className="block text-sm font-medium text-slate-700">Tipo de entrada</label>
          <select
            id="tipo-ticket"
            {...register('type')}
            disabled={ocupado}
            aria-invalid={Boolean(errors.type)}
            aria-describedby={errors.type ? 'error-tipo-ticket' : undefined}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
          >
            {Object.entries(tipos).map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>{etiqueta}</option>
            ))}
          </select>
          {errors.type && <p id="error-tipo-ticket" role="alert" className="mt-2 text-sm text-red-700">{errors.type.message}</p>}
        </div>
        <p className="text-sm text-slate-600">El precio de la entrada se mostrará en la confirmación de compra.</p>
        {errors.root && <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-800">{errors.root.message}</p>}
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={ocupado}
            className="rounded-lg bg-marca-600 px-4 py-3 font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:cursor-wait disabled:opacity-60"
          >
            {ocupado ? 'Procesando compra…' : 'Confirmar compra'}
          </button>
          <button
            type="button"
            onClick={cerrar}
            disabled={ocupado}
            className="rounded-lg border border-slate-300 px-4 py-3 text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:opacity-60"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  )
}
