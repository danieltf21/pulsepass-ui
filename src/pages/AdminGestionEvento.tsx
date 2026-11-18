import { useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router'
import { z } from 'zod'
import { ApiError } from '../api/http'
import type { CategoriaEvento, EstadoEvento } from '../api/eventos.tipos'
import { useAsociarArtista, useEvento, usePublicarEvento } from '../hooks/useEventos'
import { useArtistasActivos } from '../hooks/useArtistas'
import Modal from '../components/ui/Modal'
import { formatearFecha } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

const codigoSchema = z.string().trim().min(1).max(50)
const avisoSchema = z.object({ eventoCreado: z.string() })
const asociacionSchema = z.object({ artistId: z.number({ message: 'Selecciona un artista.' }).int().positive('Selecciona un artista.') })
type Asociacion = z.infer<typeof asociacionSchema>
const categorias: Record<CategoriaEvento, string> = {
  MUSIC: 'Música', SPORTS: 'Deportes', TECHNOLOGY: 'Tecnología',
  EDUCATION: 'Educación', CULTURE: 'Cultura', ENTERTAINMENT: 'Entretenimiento',
}
const estados: Record<EstadoEvento, string> = {
  DRAFT: 'Borrador', PUBLISHED: 'Publicado', SOLD_OUT: 'Agotado', CANCELLED: 'Cancelado', FINISHED: 'Finalizado',
}

export default function AdminGestionEvento() {
  const { eventCode } = useParams()
  const codigo = codigoSchema.safeParse(eventCode)
  const ubicacion = useLocation()
  const aviso = avisoSchema.safeParse(ubicacion.state)
  const consulta = useEvento(codigo.success ? codigo.data : '')
  const publicacion = usePublicarEvento(codigo.success ? codigo.data : '')
  const asociacion = useAsociarArtista(codigo.success ? codigo.data : '')
  const artistas = useArtistasActivos()
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<Asociacion>({
    resolver: zodResolver(asociacionSchema), defaultValues: { artistId: 0 },
  })
  const navegar = useNavigate()
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [publicado, setPublicado] = useState<string | null>(null)
  const enviando = useRef(false)
  const asociando = useRef(false)
  const [artistaAsociado, setArtistaAsociado] = useState<string | null>(null)
  const sinArtistasDisponibles = !artistas.data?.some((artista) => !consulta.data?.artists.some((asociado) => asociado.id === artista.id))
  const noDisponible = !codigo.success || (consulta.error instanceof ApiError && consulta.error.status === 404)

  function cerrarPublicacion() {
    if (enviando.current) return
    setConfirmando(null)
    publicacion.reset()
  }

  async function asociar({ artistId }: Asociacion) {
    if (asociando.current) return
    if (consulta.data?.artists.some((artista) => artista.id === artistId)) {
      setError('artistId', { message: 'Este artista ya está asociado al evento.' })
      return
    }
    asociando.current = true
    setArtistaAsociado(null)
    try {
      const evento = await asociacion.mutateAsync(artistId)
      reset()
      setArtistaAsociado(evento.eventCode)
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 403) {
        void navegar(RUTAS.sinPermisos, { replace: true })
      } else {
        setError('root', { message: error instanceof ApiError ? error.message : 'No se pudo asociar el artista. Inténtalo de nuevo.' })
      }
    } finally {
      asociando.current = false
    }
  }

  async function confirmarPublicacion() {
    if (enviando.current) return
    enviando.current = true
    try {
      const evento = await publicacion.mutateAsync()
      setConfirmando(null)
      setPublicado(evento.eventCode)
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 403) {
        void navegar(RUTAS.sinPermisos, { replace: true })
      }
    } finally {
      enviando.current = false
    }
  }

  if (consulta.error instanceof ApiError && consulta.error.status === 403) {
    return <Navigate to={RUTAS.sinPermisos} replace />
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link to={RUTAS.adminEventos} className="rounded text-marca-700 dark:text-indigo-300 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600">
        Volver a eventos
      </Link>
      {noDisponible ? (
        <section className="mt-8">
          <h1 className="font-titulo text-3xl font-bold">Evento no disponible</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-400">No se encontró el evento solicitado.</p>
        </section>
      ) : consulta.isPending ? (
        <p role="status" className="mt-8 text-slate-600 dark:text-slate-400">Cargando evento…</p>
      ) : consulta.isError ? (
        <section role="alert" className="mt-8 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6 text-red-900 dark:text-red-200">
          <h1 className="font-titulo text-2xl font-bold">No se pudo cargar el evento</h1>
          <p className="mt-3">{consulta.error instanceof ApiError ? consulta.error.message : 'Inténtalo de nuevo.'}</p>
          <button type="button" disabled={consulta.isFetching} onClick={() => void consulta.refetch()} className="mt-4 rounded-lg bg-marca-600 px-4 py-3 text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:opacity-60">
            {consulta.isFetching ? 'Reintentando…' : 'Reintentar'}
          </button>
        </section>
      ) : (
        <article className="mt-8">
          {aviso.success && aviso.data.eventoCreado === consulta.data.eventCode && (
            <p role="status" aria-live="off" className="mb-6 rounded-lg bg-green-50 dark:bg-green-950 p-4 text-green-900 dark:text-green-200">Evento creado correctamente.</p>
          )}
          <h1 className="font-titulo text-3xl font-bold">{consulta.data.name}</h1>
          <p className="mt-2 break-all font-mono text-slate-600 dark:text-slate-400">{consulta.data.eventCode}</p>
          <p className="mt-4 inline-block rounded-full bg-marca-50 dark:bg-indigo-950 px-3 py-1 font-semibold text-marca-700 dark:text-indigo-300">{estados[consulta.data.status]}</p>
          <dl className="mt-6 grid gap-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 sm:grid-cols-2">
            <div><dt className="font-medium">Categoría</dt><dd className="mt-1 text-slate-600 dark:text-slate-400">{categorias[consulta.data.category]}</dd></div>
            <div><dt className="font-medium">Fecha y hora</dt><dd className="mt-1 text-slate-600 dark:text-slate-400"><time dateTime={consulta.data.eventDate}>{formatearFecha(consulta.data.eventDate)}</time></dd></div>
            <div><dt className="font-medium">Edad mínima</dt><dd className="mt-1 text-slate-600 dark:text-slate-400">{consulta.data.minimumAge} años</dd></div>
            <div><dt className="font-medium">Sede</dt><dd className="mt-1 text-slate-600 dark:text-slate-400">{consulta.data.venueName} ({consulta.data.venueCode})</dd></div>
          </dl>
          <p className="mt-6 whitespace-pre-line text-slate-600 dark:text-slate-400">{consulta.data.description?.trim() || 'Este evento aún no tiene descripción.'}</p>
          <section aria-labelledby="publicacion-evento" className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
            <h2 id="publicacion-evento" className="font-titulo text-xl font-bold">Publicación</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">El evento será visible al público una vez publicado.</p>
            <button
              type="button"
              disabled={consulta.data.status !== 'DRAFT' || consulta.isFetching || publicacion.isPending || asociacion.isPending}
              onClick={() => {
                publicacion.reset()
                setPublicado(null)
                setConfirmando(consulta.data.eventCode)
              }}
              className="mt-4 rounded-lg bg-marca-600 px-5 py-3 font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Publicar evento
            </button>
            {publicado === consulta.data.eventCode && <p role="status" aria-live="off" className="mt-4 rounded-lg bg-green-50 dark:bg-green-950 p-4 text-green-900 dark:text-green-200">Evento publicado correctamente.</p>}
          </section>
          <section aria-labelledby="artistas-asociados" className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
            <h2 id="artistas-asociados" className="font-titulo text-xl font-bold">Artistas asociados</h2>
            {consulta.data.artists.length === 0 ? <p className="mt-3 text-slate-600 dark:text-slate-400">Aún no hay artistas asociados.</p> : (
              <ul className="mt-3 space-y-2">{consulta.data.artists.map((artista) => <li key={artista.id}>{artista.stageName}</li>)}</ul>
            )}
            <form noValidate onSubmit={(event) => { void handleSubmit(asociar)(event) }} aria-busy={asociacion.isPending} className="mt-6">
              <label htmlFor="artista-evento" className="block font-medium">Agregar artista</label>
              <div className="mt-2 flex flex-wrap gap-3">
                <select
                  id="artista-evento"
                  {...register('artistId', { valueAsNumber: true })}
                  disabled={isSubmitting || asociacion.isPending || publicacion.isPending || artistas.isPending || artistas.isError || sinArtistasDisponibles}
                  aria-invalid={Boolean(errors.artistId)}
                  aria-describedby={errors.artistId ? 'error-artista-evento' : undefined}
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:opacity-60"
                >
                  <option value={0}>Selecciona un artista</option>
                  {artistas.data?.map((artista) => (
                    <option key={artista.id} value={artista.id} disabled={consulta.data.artists.some((asociado) => asociado.id === artista.id)}>{artista.stageName}</option>
                  ))}
                </select>
                <button type="submit" disabled={isSubmitting || asociacion.isPending || publicacion.isPending || artistas.isPending || artistas.isError || sinArtistasDisponibles} className="rounded-lg bg-marca-600 px-5 py-3 font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:opacity-60">
                  {asociacion.isPending ? 'Asociando…' : 'Asociar'}
                </button>
              </div>
              {errors.artistId && <p id="error-artista-evento" role="alert" className="mt-2 text-red-800 dark:text-red-200">{errors.artistId.message}</p>}
              {errors.root && <p role="alert" aria-live="off" className="mt-4 rounded-lg bg-red-50 dark:bg-red-950 p-4 text-red-800 dark:text-red-200">{errors.root.message}</p>}
              {artistas.isPending && <p role="status" className="mt-3 text-slate-600 dark:text-slate-400">Cargando artistas…</p>}
              {artistas.isError && <div role="alert" className="mt-3 text-red-800 dark:text-red-200"><p>No se pudieron cargar los artistas.</p><button type="button" disabled={artistas.isFetching} onClick={() => void artistas.refetch()} className="mt-2 min-h-11 rounded px-3 underline focus-visible:outline-2 focus-visible:outline-marca-600">Reintentar artistas</button></div>}
              {artistas.isSuccess && sinArtistasDisponibles && <p role="status" className="mt-3 text-slate-600 dark:text-slate-400">No hay artistas activos disponibles para asociar.</p>}
              {artistaAsociado === consulta.data.eventCode && <p role="status" aria-live="off" className="mt-4 rounded-lg bg-green-50 dark:bg-green-950 p-4 text-green-900 dark:text-green-200">Artista asociado correctamente.</p>}
            </form>
          </section>
          <Link to={RUTAS.ticketsPagadosEvento(consulta.data.eventCode)} className="mt-8 inline-block rounded text-marca-700 dark:text-indigo-300 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600">
            Ver tickets pagados
          </Link>
        </article>
      )}
      {codigo.success && confirmando === codigo.data && (
        <Modal abierto titulo="Publicar evento" onCerrar={cerrarPublicacion} bloqueado={publicacion.isPending}>
          <p className="text-slate-700 dark:text-slate-300">¿Confirmas que quieres publicar el evento <span className="break-all font-mono">{codigo.data}</span>?</p>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Al publicarlo aparecerá en la cartelera pública.</p>
          {publicacion.isError && <p role="alert" aria-live="off" className="mt-4 rounded-lg bg-red-50 dark:bg-red-950 p-4 text-red-800 dark:text-red-200">{publicacion.error instanceof ApiError ? publicacion.error.message : 'No se pudo publicar el evento. Inténtalo de nuevo.'}</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" disabled={publicacion.isPending} onClick={() => void confirmarPublicacion()} className="rounded-lg bg-marca-600 px-5 py-3 font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:opacity-60">
              {publicacion.isPending ? 'Publicando…' : 'Confirmar publicación'}
            </button>
            <button type="button" disabled={publicacion.isPending} onClick={cerrarPublicacion} className="rounded-lg border border-slate-300 dark:border-slate-600 px-5 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:opacity-60">Cancelar</button>
          </div>
        </Modal>
      )}
    </main>
  )
}
