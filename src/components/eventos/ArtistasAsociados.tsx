import { zodResolver } from '@hookform/resolvers/zod'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import type { DetalleEvento } from '../../api/eventos.tipos'
import { ApiError } from '../../api/http'
import type { useArtistasActivos } from '../../hooks/useArtistas'
import { RUTAS } from '../../lib/rutas'
import EstadoCarga from '../ui/EstadoCarga'

const asociacionSchema = z.object({ artistId: z.number({ message: 'Selecciona un artista.' }).int().positive('Selecciona un artista.') })
type Asociacion = z.infer<typeof asociacionSchema>

interface ArtistasAsociadosProps {
  evento: DetalleEvento
  artistas: ReturnType<typeof useArtistasActivos>
  asociarArtista: (artistId: number) => Promise<DetalleEvento>
  asociandoEnServidor: boolean
  publicando: boolean
}

export default function ArtistasAsociados({
  evento, artistas, asociarArtista, asociandoEnServidor, publicando,
}: ArtistasAsociadosProps) {
  const navegar = useNavigate()
  const asociando = useRef(false)
  const [artistaAsociado, setArtistaAsociado] = useState<string | null>(null)
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<Asociacion>({
    resolver: zodResolver(asociacionSchema), defaultValues: { artistId: 0 },
  })
  const sinArtistasDisponibles = !artistas.data?.some((artista) =>
    !evento.artists.some((asociado) => asociado.id === artista.id))
  const formularioBloqueado = isSubmitting || asociandoEnServidor || publicando
    || artistas.isPending || artistas.isError || sinArtistasDisponibles

  async function asociar({ artistId }: Asociacion) {
    if (asociando.current) return
    if (evento.artists.some((artista) => artista.id === artistId)) {
      setError('artistId', { message: 'Este artista ya está asociado al evento.' })
      return
    }
    asociando.current = true
    setArtistaAsociado(null)
    try {
      const actualizado = await asociarArtista(artistId)
      reset()
      setArtistaAsociado(actualizado.eventCode)
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

  return (
    <section aria-labelledby="artistas-asociados" className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
      <h2 id="artistas-asociados" className="font-titulo text-xl font-bold">Artistas asociados</h2>
      {evento.artists.length === 0 ? <p className="mt-3 text-slate-600 dark:text-slate-400">Aún no hay artistas asociados.</p> : (
        <ul className="mt-3 space-y-2">{evento.artists.map((artista) => <li key={artista.id}>{artista.stageName}</li>)}</ul>
      )}
      <form noValidate onSubmit={(event) => { void handleSubmit(asociar)(event) }} aria-busy={asociandoEnServidor} className="mt-6">
        <label htmlFor="artista-evento" className="block font-medium">Agregar artista</label>
        <div className="mt-2 flex flex-col items-start gap-3 sm:flex-row sm:items-stretch">
          <select
            id="artista-evento"
            {...register('artistId', { valueAsNumber: true })}
            disabled={formularioBloqueado}
            aria-invalid={Boolean(errors.artistId)}
            aria-describedby={errors.artistId ? 'error-artista-evento' : undefined}
            className="w-full min-w-0 rounded-lg border border-slate-500 bg-white dark:bg-slate-900 px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:opacity-60 sm:flex-1"
          >
            <option value={0}>Selecciona un artista</option>
            {artistas.data?.map((artista) => (
              <option key={artista.id} value={artista.id} disabled={evento.artists.some((asociado) => asociado.id === artista.id)}>{artista.stageName}</option>
            ))}
          </select>
          <button type="submit" disabled={formularioBloqueado} className="rounded-lg bg-marca-600 px-5 py-3 font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:opacity-60">
            {asociandoEnServidor ? 'Asociando…' : 'Asociar'}
          </button>
        </div>
        {errors.artistId && <p id="error-artista-evento" role="alert" className="mt-2 text-red-800 dark:text-red-200">{errors.artistId.message}</p>}
        {errors.root && <p role="alert" aria-live="off" className="mt-4 rounded-lg bg-red-50 dark:bg-red-950 p-4 text-red-800 dark:text-red-200">{errors.root.message}</p>}
        {artistas.isPending && <EstadoCarga className="mt-3">Cargando artistas…</EstadoCarga>}
        {artistas.isError && <div role="alert" className="mt-3 text-red-800 dark:text-red-200"><p>No se pudieron cargar los artistas.</p><button type="button" disabled={artistas.isFetching} onClick={() => void artistas.refetch()} className="mt-2 min-h-11 rounded px-3 underline focus-visible:outline-2 focus-visible:outline-marca-600">Reintentar artistas</button></div>}
        {artistas.isSuccess && sinArtistasDisponibles && <p role="status" className="mt-3 text-slate-600 dark:text-slate-400">No hay artistas activos disponibles para asociar.</p>}
        {artistaAsociado === evento.eventCode && <p role="status" aria-live="off" className="mt-4 rounded-lg bg-green-50 dark:bg-green-950 p-4 text-green-900 dark:text-green-200">Artista asociado correctamente.</p>}
      </form>
    </section>
  )
}
