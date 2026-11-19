import { ApiError } from '../api/http'

export function reintentarConsulta(intentosFallidos: number, error: Error): boolean {
  return error instanceof ApiError && intentosFallidos < 1
    && (error.status === 0 || (error.status >= 500 && error.status < 600))
}
