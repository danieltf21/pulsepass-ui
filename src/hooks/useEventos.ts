import { useQuery } from '@tanstack/react-query'
import { obtenerEvento, obtenerEventosPorArtista, obtenerEventosPublicados } from '../api/eventos'
import { ApiError } from '../api/http'

function reintentarConsulta(intentosFallidos: number, error: Error): boolean {
  if (!(error instanceof ApiError)) return false

  const esErrorDeRed = error.status === 0
  const esErrorDelServidor = error.status >= 500 && error.status < 600

  return intentosFallidos < 1 && (esErrorDeRed || esErrorDelServidor)
}

export function useEventos(habilitado = true) {
  return useQuery({
    queryKey: ['eventos', 'publicados'],
    queryFn: ({ signal }) => obtenerEventosPublicados(signal),
    enabled: habilitado,
    retry: reintentarConsulta,
  })
}

export function useEvento(eventCode: string) {
  return useQuery({
    queryKey: ['evento', eventCode],
    queryFn: ({ signal }) => obtenerEvento(eventCode, signal),
    enabled: eventCode.trim().length > 0,
    retry: reintentarConsulta,
  })
}

export function useEventosPorArtista(stageName: string) {
  return useQuery({
    queryKey: ['eventos', 'artista', stageName],
    queryFn: ({ signal }) => obtenerEventosPorArtista(stageName, signal),
    enabled: stageName.trim().length > 0,
    retry: reintentarConsulta,
  })
}
