import { useQuery } from '@tanstack/react-query'
import { obtenerSede, obtenerSedesActivas } from '../api/sedes'
import { reintentarConsulta } from './reintentarConsulta'

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
