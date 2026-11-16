import { Link, useNavigate } from 'react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { EstadoEvento } from '../api/eventos.tipos'
import { useEventosCreados } from '../hooks/useEventos'
import { RUTAS } from '../lib/rutas'

const busquedaSchema = z.object({ eventCode: z.string().trim().min(1, 'Escribe el código del evento.').max(50, 'Usa como máximo 50 caracteres.') })
type Busqueda = z.infer<typeof busquedaSchema>
const estados: Record<EstadoEvento, string> = {
  DRAFT: 'Borrador', PUBLISHED: 'Publicado', SOLD_OUT: 'Agotado', CANCELLED: 'Cancelado', FINISHED: 'Finalizado',
}

export default function AdminEventos() {
  const navegar = useNavigate()
  const { data: creados = [] } = useEventosCreados()
  const { register, handleSubmit, formState: { errors } } = useForm<Busqueda>({
    resolver: zodResolver(busquedaSchema), defaultValues: { eventCode: '' },
  })

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-titulo text-3xl font-bold">Administración de eventos</h1>
        <Link to={RUTAS.adminCrearEvento} className="rounded-lg bg-marca-600 px-5 py-3 font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600">
          Nuevo evento
        </Link>
      </div>
      <form noValidate onSubmit={handleSubmit(({ eventCode }) => { void navegar(RUTAS.administrarEvento(eventCode)) })} className="mt-8">
        <label htmlFor="buscar-evento-admin" className="block font-medium">Buscar evento por código</label>
        <div className="mt-2 flex flex-wrap gap-3">
          <input id="buscar-evento-admin" {...register('eventCode')} aria-invalid={Boolean(errors.eventCode)} aria-describedby={errors.eventCode ? 'error-buscar-evento' : undefined} className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 font-mono focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600" />
          <button type="submit" className="rounded-lg bg-marca-600 px-5 py-3 font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600">Abrir</button>
        </div>
        {errors.eventCode && <p id="error-buscar-evento" role="alert" className="mt-2 text-red-800">{errors.eventCode.message}</p>}
      </form>
      <section aria-labelledby="creados-sesion" className="mt-10">
        <h2 id="creados-sesion" className="font-titulo text-xl font-bold">Creados en esta sesión</h2>
        {creados.length === 0 ? <p role="status" className="mt-4 rounded-xl border border-slate-200 bg-white p-6 text-slate-600">Aún no has creado eventos en esta sesión.</p> : (
          <ul className="mt-4 space-y-4">
            {creados.map((evento) => (
              <li key={evento.eventCode} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5">
                <div className="min-w-0">
                  <h3 className="font-semibold">{evento.name}</h3>
                  <p className="mt-1 break-all font-mono text-sm text-slate-600">{evento.eventCode}</p>
                  <p className="mt-2 text-sm font-medium text-marca-700">{estados[evento.status]}</p>
                </div>
                <Link to={RUTAS.administrarEvento(evento.eventCode)} aria-label={`Gestionar evento ${evento.eventCode}`} className="rounded-lg border border-marca-600 px-4 py-3 text-marca-700 hover:bg-marca-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600">Gestionar</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
