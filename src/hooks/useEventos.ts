import { useQuery } from '@tanstack/react-query'
import { obtenerEventosPublicados } from '../api/eventos'
import { ApiError } from '../api/http'

export function useEventos() {
  return useQuery({
    queryKey: ['eventos', 'publicados'],
    queryFn: ({ signal }) => obtenerEventosPublicados(signal),
    retry: (intentosFallidos, error) => {
      if (!(error instanceof ApiError)) return false

      const esErrorDeRed = error.status === 0
      const esErrorDelServidor = error.status >= 500 && error.status < 600

      return intentosFallidos < 1 && (esErrorDeRed || esErrorDelServidor)
    },
  })
}
