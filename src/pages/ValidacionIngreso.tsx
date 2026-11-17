import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ApiError } from '../api/http'
import type { EstadoTicket, TipoTicket } from '../api/tickets.tipos'
import { useMarcarTicketUsado, useTicket } from '../hooks/useTickets'

const busquedaSchema = z.object({ codigo: z.string().trim().min(1, 'Escribe el código del ticket.') })
type Busqueda = z.infer<typeof busquedaSchema>
const estados: Record<EstadoTicket, string> = {
  RESERVED: 'Reservado', PAID: 'Pagado', CANCELLED: 'Cancelado', USED: 'Usado',
}
const tipos: Record<TipoTicket, string> = {
  GENERAL: 'General', VIP: 'VIP', BACKSTAGE: 'Backstage', STUDENT: 'Estudiante',
}

function mensajeError(error: Error): string {
  if (error instanceof ApiError) {
    if (error.status === 404) return 'Ticket no encontrado'
    if (error.status === 403) return 'Sin permisos'
    return error.message
  }
  return 'No se pudo completar la operación. Inténtalo de nuevo.'
}

export default function ValidacionIngreso() {
  const [codigo, setCodigo] = useState('')
  const consulta = useTicket(codigo)
  const ingreso = useMarcarTicketUsado(codigo)
  const enviando = useRef(false)
  const campoCodigo = useRef<HTMLInputElement>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Busqueda>({
    resolver: zodResolver(busquedaSchema), defaultValues: { codigo: '' },
  })
  const registroCodigo = register('codigo')
  useEffect(() => {
    if (!ingreso.isPending) campoCodigo.current?.focus()
  }, [ingreso.isPending])

  function buscar(datos: Busqueda) {
    if (enviando.current) return
    ingreso.reset()
    if (datos.codigo === codigo) void consulta.refetch()
    else setCodigo(datos.codigo)
  }

  async function registrarIngreso() {
    if (enviando.current) return
    enviando.current = true
    try {
      await ingreso.mutateAsync()
      reset()
    } catch {
      // Mantiene el resultado y muestra el error devuelto por el servidor.
    } finally {
      enviando.current = false
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-titulo text-3xl font-bold">Validación de ingreso</h1>
      <form noValidate onSubmit={(event) => { void handleSubmit(buscar)(event) }} className="mt-8">
        <label htmlFor="codigo-ticket" className="block font-medium">Código de ticket</label>
        <div className="mt-2 flex flex-wrap gap-3">
          <input
            id="codigo-ticket"
            {...registroCodigo}
            ref={(elemento) => {
              registroCodigo.ref(elemento)
              campoCodigo.current = elemento
            }}
            disabled={ingreso.isPending}
            autoComplete="off"
            spellCheck={false}
            aria-invalid={Boolean(errors.codigo)}
            aria-describedby={errors.codigo ? 'error-codigo-ticket' : undefined}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 font-mono focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
          />
          <button type="submit" disabled={consulta.isFetching || ingreso.isPending} className="rounded-lg bg-marca-600 px-5 py-3 font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:opacity-60">
            {consulta.isFetching ? 'Buscando…' : 'Buscar'}
          </button>
        </div>
        {errors.codigo && <p id="error-codigo-ticket" role="alert" className="mt-2 text-red-800">{errors.codigo.message}</p>}
      </form>

      {codigo && (
        <section aria-label="Resultado de la búsqueda" aria-busy={consulta.isFetching} className="mt-8">
          {consulta.isPending ? (
            <p role="status">Buscando ticket…</p>
          ) : consulta.isError ? (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
              <h2 className="text-xl font-semibold">{mensajeError(consulta.error)}</h2>
              <p className="mt-2">Revisa el código y vuelve a buscar.</p>
            </div>
          ) : (
            <article className="rounded-xl border border-slate-300 bg-white p-6 shadow-sm">
              <h2 className="font-titulo text-2xl font-bold">{consulta.data.eventName}</h2>
              <p className="mt-3 break-all font-mono">{consulta.data.ticketCode}</p>
              <p className="mt-4 text-lg font-semibold">{estados[consulta.data.status]}</p>
              <p className="mt-2">{tipos[consulta.data.type]}</p>
              <p className="mt-2 break-all">Titular: {consulta.data.userEmail}</p>
              {consulta.data.status === 'PAID' && (
                <button
                  type="button"
                  disabled={ingreso.isPending || consulta.isFetching}
                  onClick={() => void registrarIngreso()}
                  className="mt-6 rounded-lg bg-marca-600 px-5 py-3 font-semibold text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:opacity-60"
                >
                  {ingreso.isPending ? 'Registrando ingreso…' : 'Marcar como usado'}
                </button>
              )}
            </article>
          )}
        </section>
      )}
      {ingreso.isSuccess && <p role="status" aria-live="off" className="mt-6 rounded-xl bg-green-50 p-6 text-xl font-semibold text-green-900">Ingreso registrado.</p>}
      {ingreso.isError && (
        <p role="alert" aria-live="off" className={`mt-6 rounded-xl border p-6 text-lg font-medium ${ingreso.error instanceof ApiError && ingreso.error.status === 409 ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-red-200 bg-red-50 text-red-900'}`}>
          {mensajeError(ingreso.error)}
        </p>
      )}
    </main>
  )
}
