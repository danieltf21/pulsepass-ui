import { useQuery } from '@tanstack/react-query'
import {
  obtenerArtista,
  obtenerArtistaPorNombre,
  obtenerArtistasActivos,
} from '../api/artistas'
import { ApiError } from '../api/http'

function reintentarConsulta(intentosFallidos: number, error: Error): boolean {
  if (!(error instanceof ApiError)) return false

  return intentosFallidos < 1
    && (error.status === 0 || (error.status >= 500 && error.status < 600))
}

export function useArtistasActivos() {
  return useQuery({
    queryKey: ['artistas', 'activos'],
    queryFn: ({ signal }) => obtenerArtistasActivos(signal),
    retry: reintentarConsulta,
  })
}

export function useArtista(id: number) {
  return useQuery({
    queryKey: ['artista', id],
    queryFn: ({ signal }) => obtenerArtista(id, signal),
    enabled: Number.isSafeInteger(id) && id > 0,
    retry: reintentarConsulta,
  })
}

export function useArtistaPorNombre(stageName: string) {
  return useQuery({
    queryKey: ['artista', 'nombre', stageName],
    queryFn: ({ signal }) => obtenerArtistaPorNombre(stageName, signal),
    enabled: stageName.trim().length > 0,
    retry: reintentarConsulta,
  })
}
