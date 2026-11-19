import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ApiError } from '../api/http'
import type { Ticket, TipoTicket } from '../api/tickets.tipos'
import PrecioCOP from '../components/ui/PrecioCOP'
import Tabla, { type ColumnaTabla } from '../components/ui/Tabla'
import { useMarcarTicketUsado, useTicketsPagadosPorEvento } from '../hooks/useTickets'
import { RUTAS } from '../lib/rutas'

const busquedaSchema = z.object({ eventCode: z.string().trim().min(1, 'Escribe el código del evento.').max(50, 'Usa como máximo 50 caracteres.') })
type Busqueda = z.infer<typeof busquedaSchema>
const tipos: Record<TipoTicket, string> = {
  GENERAL: 'General', VIP: 'VIP', BACKSTAGE: 'Backstage', STUDENT: 'Estudiante',
}

function UsarTicket({ ticket, onUsado }: { ticket: Ticket; onUsado: (codigo: string) => void }) {
  const ingreso = useMarcarTicketUsado(ticket.ticketCode)
  const enviando = useRef(false)
  async function usar() {
    if (enviando.current) return
    enviando.current = true
    try {
      await ingreso.mutateAsync()
      onUsado(ticket.ticketCode)
    } catch {
      // El error queda visible junto a la acción de la entrada.
    } finally {
      enviando.current = false
    }
  }
  return (
    <div>
      <button
        type="button"
        aria-label={`Usar entrada ${ticket.ticketCode}`}
        disabled={ingreso.isPending}
        onClick={() => void usar()}
        className="min-h-11 rounded-lg bg-marca-600 px-4 py-3 font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:opacity-60"
      >
        {ingreso.isPending ? 'Registrando…' : 'Usar'}
      </button>
      {ingreso.isError && <p role="alert" aria-live="off" className="mt-2 max-w-xs text-sm text-red-800 dark:text-red-200">{ingreso.error instanceof ApiError ? ingreso.error.message : 'No se pudo registrar el ingreso.'}</p>}
    </div>
  )
}

export default function TicketsPagadosEvento() {
  const { eventCode } = useParams()
  const parametro = busquedaSchema.safeParse({ eventCode })
  const codigo = parametro.success ? parametro.data.eventCode : ''
  const navegar = useNavigate()
  const consulta = useTicketsPagadosPorEvento(codigo)
  const [ultimoIngreso, setUltimoIngreso] = useState<{ evento: string; ticket: string } | null>(null)
  const { register, handleSubmit, reset, setFocus, formState: { errors } } = useForm<Busqueda>({
    resolver: zodResolver(busquedaSchema), defaultValues: { eventCode: codigo },
  })
  useEffect(() => { reset({ eventCode: codigo }) }, [codigo, reset])
  const columnas: ColumnaTabla<Ticket>[] = [
    { id: 'codigo', titulo: 'Código', renderizar: (ticket) => <span className="break-all font-mono">{ticket.ticketCode}</span> },
    { id: 'tipo', titulo: 'Tipo', renderizar: (ticket) => tipos[ticket.type] },
    { id: 'titular', titulo: 'Titular', renderizar: (ticket) => <span className="break-all">{ticket.userEmail}</span> },
    { id: 'precio', titulo: 'Precio', renderizar: (ticket) => <PrecioCOP valor={ticket.price} /> },
    { id: 'estado', titulo: 'Estado', renderizar: () => 'Pagado' },
    { id: 'accion', titulo: 'Acción', renderizar: (ticket) => <UsarTicket ticket={ticket} onUsado={(usado) => setUltimoIngreso({ evento: codigo, ticket: usado })} /> },
  ]

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-titulo text-3xl font-bold">Tickets pagados{codigo && <> · <span className="break-all font-mono">{codigo}</span></>}</h1>
      <form noValidate onSubmit={handleSubmit(({ eventCode: nuevoCodigo }) => {
        setFocus('eventCode')
        setUltimoIngreso(null)
        if (nuevoCodigo === codigo) void consulta.refetch()
        else void navegar(RUTAS.ticketsPagadosEvento(nuevoCodigo))
      })} className="mt-6">
        <label htmlFor="evento-tickets" className="block font-medium">Código del evento</label>
        <div className="mt-2 flex flex-wrap gap-3">
          <input id="evento-tickets" {...register('eventCode')} aria-invalid={Boolean(errors.eventCode)} aria-describedby={errors.eventCode ? 'error-evento-tickets' : undefined} className="min-w-0 flex-1 rounded-lg border border-slate-500 bg-white dark:bg-slate-900 px-4 py-3 font-mono focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600" />
          <button type="submit" disabled={consulta.isFetching} className="rounded-lg bg-marca-600 px-5 py-3 font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:opacity-60">Ir</button>
        </div>
        {errors.eventCode && <p id="error-evento-tickets" role="alert" className="mt-2 text-red-800 dark:text-red-200">{errors.eventCode.message}</p>}
      </form>
      {ultimoIngreso?.evento === codigo && <p role="status" aria-live="off" className="mt-6 rounded-lg bg-green-50 dark:bg-green-950 p-4 text-green-900 dark:text-green-200">Ingreso registrado para <span className="break-all font-mono">{ultimoIngreso.ticket}</span>.</p>}
      <section aria-label="Tickets pagados por evento" aria-busy={consulta.isFetching} className="mt-8">
        {!codigo ? <p className="text-slate-600 dark:text-slate-400">Introduce un código de evento válido para consultar sus entradas pagadas.</p>
          : consulta.isPending ? <p role="status">Cargando entradas pagadas…</p>
          : consulta.isError ? (
            <div role="alert" className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6 text-red-900 dark:text-red-200">
              <h2 className="text-xl font-semibold">{consulta.error instanceof ApiError && consulta.error.status === 403 ? 'Sin permisos' : consulta.error instanceof ApiError && consulta.error.status === 404 ? 'Evento no encontrado' : 'No se pudieron cargar las entradas pagadas'}</h2>
              <p className="mt-2">{consulta.error instanceof ApiError ? consulta.error.message : 'Inténtalo de nuevo.'}</p>
              <button type="button" disabled={consulta.isFetching} onClick={() => void consulta.refetch()} className="mt-4 min-h-11 rounded-lg border border-red-300 dark:border-red-700 px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-60">Reintentar</button>
            </div>
          ) : (
            <>
              <p className="mb-4 font-semibold">Total: {consulta.data.length}</p>
              {consulta.data.length === 0 ? <p role="status" className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-slate-600 dark:text-slate-400">Este evento no tiene entradas pagadas.</p>
                : <Tabla titulo="Entradas pagadas del evento" columnas={columnas} filas={consulta.data} claveFila={(ticket) => ticket.ticketCode} />}
            </>
          )}
      </section>
    </main>
  )
}
