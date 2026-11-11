import { z } from 'zod'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')

const errorResponseSchema = z.object({
  timestamp: z.iso.datetime({ local: true }),
  status: z.number().int(),
  error: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.string()).nullable(),
})

export class ApiError extends Error {
  readonly status: number
  readonly details: Record<string, string>

  constructor(status: number, message: string, details: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

function mensajePorEstado(status: number): string {
  switch (status) {
    case 400: return 'Revisa los datos enviados.'
    case 401: return 'Debes iniciar sesión para continuar.'
    case 403: return 'No tienes permisos para realizar esta acción.'
    case 404: return 'El recurso solicitado no está disponible.'
    case 409: return 'No se pudo completar la operación por un conflicto.'
    default: return 'No se pudo completar la solicitud. Inténtalo de nuevo.'
  }
}

// Devuelve unknown: cada módulo de API valida su respuesta de éxito con Zod.
export async function http(ruta: string, opciones: RequestInit = {}): Promise<unknown> {
  const headers = new Headers(opciones.headers)
  if (!headers.has('Accept')) headers.set('Accept', 'application/json')

  let respuesta: Response
  try {
    respuesta = await fetch(`${API_BASE_URL}/${ruta.replace(/^\//, '')}`, {
      ...opciones,
      headers,
    })
  } catch (error: unknown) {
    // Conserva la cancelación para que TanStack Query pueda gestionarla.
    if (opciones.signal?.aborted) throw error
    throw new ApiError(0, 'No se pudo conectar con el servidor. Revisa tu conexión.')
  }

  if (!respuesta.ok) {
    let datos: unknown
    try {
      datos = await respuesta.json()
    } catch (error: unknown) {
      if (opciones.signal?.aborted) throw error
      throw new ApiError(respuesta.status, mensajePorEstado(respuesta.status))
    }

    const resultado = errorResponseSchema.safeParse(datos)
    if (resultado.success) {
      const { message, details } = resultado.data
      // Solo expone mensajes de validación/conflicto; oculta detalles internos.
      const mensaje = respuesta.status === 400 || respuesta.status === 409
        ? message
        : mensajePorEstado(respuesta.status)
      throw new ApiError(respuesta.status, mensaje, respuesta.status === 400 ? details ?? {} : {})
    }

    throw new ApiError(respuesta.status, mensajePorEstado(respuesta.status))
  }

  if (respuesta.status === 204) return undefined

  try {
    const datos: unknown = await respuesta.json()
    return datos
  } catch (error: unknown) {
    if (opciones.signal?.aborted) throw error
    throw new ApiError(respuesta.status, 'El servidor devolvió una respuesta que no se pudo leer.')
  }
}
