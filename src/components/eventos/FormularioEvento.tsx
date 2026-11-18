import { useRef } from 'react'
import { useNavigate } from 'react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { ApiError } from '../../api/http'
import { crearEventoSchema, type CategoriaEvento, type CrearEvento, type DetalleEvento } from '../../api/eventos.tipos'
import { useCrearEvento } from '../../hooks/useEventos'
import { useSedesActivas } from '../../hooks/useSedes'
import { RUTAS } from '../../lib/rutas'

interface FormularioEventoProps {
  onCreado: (evento: DetalleEvento) => void
  onCancelar: () => void
}

const categorias: Record<CategoriaEvento, string> = {
  MUSIC: 'Música', SPORTS: 'Deportes', TECHNOLOGY: 'Tecnología',
  EDUCATION: 'Educación', CULTURE: 'Cultura', ENTERTAINMENT: 'Entretenimiento',
}
const campos = ['eventCode', 'name', 'description', 'category', 'eventDate', 'minimumAge', 'venueCode'] as const
const estiloCampo = 'mt-2 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:opacity-60'

export default function FormularioEvento({ onCreado, onCancelar }: FormularioEventoProps) {
  const crear = useCrearEvento()
  const sedes = useSedesActivas()
  const navegar = useNavigate()
  const enviando = useRef(false)
  const { register, control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<CrearEvento>({
    resolver: zodResolver(crearEventoSchema),
    defaultValues: { eventCode: '', name: '', description: '', category: 'MUSIC', eventDate: '', minimumAge: 0, venueCode: '' },
  })
  const descripcion = useWatch({ control, name: 'description' }) ?? ''
  const ocupado = isSubmitting || crear.isPending
  const sinSedes = !sedes.data?.length

  async function enviar(datos: CrearEvento) {
    if (enviando.current) return
    enviando.current = true
    try {
      const evento = await crear.mutateAsync(datos)
      onCreado(evento)
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 403) {
        void navegar(RUTAS.sinPermisos, { replace: true })
        return
      }
      if (error instanceof ApiError && error.status === 400) {
        for (const campo of campos) {
          const mensaje = error.details[campo]
          if (mensaje) setError(campo, { type: 'server', message: mensaje })
        }
      }
      setError('root', { message: error instanceof ApiError ? error.message : 'No se pudo crear el evento. Inténtalo de nuevo.' })
    } finally {
      enviando.current = false
    }
  }

  function errorCampo(campo: typeof campos[number]) {
    return errors[campo] && <p id={`error-${campo}`} role="alert" className="mt-2 text-sm text-red-800 dark:text-red-200">{errors[campo]?.message}</p>
  }

  return (
    <form noValidate aria-busy={ocupado} onSubmit={(event) => { void handleSubmit(enviar)(event) }} className="mt-8 space-y-6">
      {errors.root && <p role="alert" aria-live="off" className="rounded-lg bg-red-50 dark:bg-red-950 p-4 text-red-800 dark:text-red-200">{errors.root.message}</p>}
      <fieldset disabled={ocupado} className="space-y-6">
        <legend className="sr-only">Datos del nuevo evento</legend>
        {([
          { campo: 'eventCode', etiqueta: 'Código del evento', tipo: 'text' },
          { campo: 'name', etiqueta: 'Nombre', tipo: 'text' },
        ] as const).map(({ campo, etiqueta, tipo }) => (
          <div key={campo}>
            <label htmlFor={campo} className="block font-medium">{etiqueta}</label>
            <input id={campo} type={tipo} {...register(campo)} aria-invalid={Boolean(errors[campo])} aria-describedby={errors[campo] ? `error-${campo}` : undefined} className={estiloCampo} />
            {errorCampo(campo)}
          </div>
        ))}
        <div>
          <label htmlFor="description" className="block font-medium">Descripción (opcional)</label>
          <textarea id="description" rows={4} maxLength={1000} {...register('description')} aria-invalid={Boolean(errors.description)} aria-describedby={`contador-descripcion${errors.description ? ' error-description' : ''}`} className={estiloCampo} />
          <p id="contador-descripcion" className="mt-1 text-right text-sm text-slate-600 dark:text-slate-400">{descripcion.length}/1000</p>
          {errorCampo('description')}
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className="block font-medium">Categoría</label>
            <select id="category" {...register('category')} aria-invalid={Boolean(errors.category)} aria-describedby={errors.category ? 'error-category' : undefined} className={estiloCampo}>
              {Object.entries(categorias).map(([valor, etiqueta]) => <option key={valor} value={valor}>{etiqueta}</option>)}
            </select>
            {errorCampo('category')}
          </div>
          <div>
            <label htmlFor="minimumAge" className="block font-medium">Edad mínima</label>
            <input id="minimumAge" type="number" min={0} step={1} {...register('minimumAge', { valueAsNumber: true })} aria-invalid={Boolean(errors.minimumAge)} aria-describedby={errors.minimumAge ? 'error-minimumAge' : undefined} className={estiloCampo} />
            {errorCampo('minimumAge')}
          </div>
        </div>
        <div>
          <label htmlFor="eventDate" className="block font-medium">Fecha y hora</label>
          <input id="eventDate" type="datetime-local" {...register('eventDate')} aria-invalid={Boolean(errors.eventDate)} aria-describedby={errors.eventDate ? 'error-eventDate' : undefined} className={estiloCampo} />
          {errorCampo('eventDate')}
        </div>
        <div>
          <label htmlFor="venueCode" className="block font-medium">Sede</label>
          <select id="venueCode" {...register('venueCode')} disabled={sedes.isPending || sedes.isError || sinSedes} aria-invalid={Boolean(errors.venueCode)} aria-describedby={errors.venueCode ? 'error-venueCode' : undefined} className={estiloCampo}>
            <option value="">Selecciona una sede</option>
            {sedes.data?.map((sede) => <option key={sede.code} value={sede.code}>{sede.name} ({sede.code})</option>)}
          </select>
          {sedes.isPending && <p role="status" className="mt-2 text-slate-600 dark:text-slate-400">Cargando sedes…</p>}
          {sedes.isError && (
            <div role="alert" className="mt-2 text-red-800 dark:text-red-200">
              <p>No se pudieron cargar las sedes.</p>
              <button type="button" disabled={sedes.isFetching} onClick={() => void sedes.refetch()} className="mt-2 min-h-11 rounded px-3 underline focus-visible:outline-2 focus-visible:outline-marca-600">Reintentar</button>
            </div>
          )}
          {sedes.isSuccess && sinSedes && <p role="status" className="mt-2 text-slate-600 dark:text-slate-400">No hay sedes activas para crear un evento.</p>}
          {errorCampo('venueCode')}
        </div>
      </fieldset>
      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" disabled={ocupado} onClick={onCancelar} className="rounded-lg border border-slate-300 dark:border-slate-600 px-5 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:opacity-60">Cancelar</button>
        <button type="submit" disabled={ocupado || sedes.isPending || sedes.isError || sinSedes} className="rounded-lg bg-marca-600 px-5 py-3 font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:opacity-60">{ocupado ? 'Creando evento…' : 'Crear evento'}</button>
      </div>
    </form>
  )
}
