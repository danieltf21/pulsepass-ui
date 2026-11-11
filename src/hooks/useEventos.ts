import { useQuery } from '@tanstack/react-query'
import { obtenerEventosPublicados } from '../api/eventos'

export function useEventos() {
  return useQuery({
    queryKey: ['eventos', 'publicados'],
    queryFn: ({ signal }) => obtenerEventosPublicados(signal),
    // Sin reintentos hasta incorporar la clasificación de errores HTTP.
    retry: false,
  })
}
