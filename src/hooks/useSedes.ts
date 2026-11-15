import { useQuery } from '@tanstack/react-query'
import { obtenerSede, obtenerSedesActivas } from '../api/sedes'
import { ApiError } from '../api/http'

function reintentarConsulta(intentosFallidos: number, error: Error): boolean {
  if (!(error instanceof ApiError)) return false

  return intentosFallidos < 1
    && (error.status === 0 || (error.status >= 500 && error.status < 600))
}

export function useSedesActivas() {
  return useQuery({
    queryKey: ['sedes', 'activas'],
    queryFn: ({ signal }) => obtenerSedesActivas(signal),
    retry: reintentarConsulta,
  })
}

export function useSede(code: string) {
  return useQuery({
    queryKey: ['sede', code],
    queryFn: ({ signal }) => obtenerSede(code, signal),
    enabled: code.trim().length > 0,
    retry: reintentarConsulta,
  })
}
