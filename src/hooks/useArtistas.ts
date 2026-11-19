import { useQuery } from '@tanstack/react-query'
import {
  obtenerArtista,
  obtenerArtistaPorNombre,
  obtenerArtistasActivos,
} from '../api/artistas'
import { reintentarConsulta } from './reintentarConsulta'

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
