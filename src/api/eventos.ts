import {
  eventosPublicadosSchema,
  type ResumenEvento,
} from './eventos.tipos'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export async function obtenerEventosPublicados(
  signal?: AbortSignal,
): Promise<ResumenEvento[]> {
  const respuesta = await fetch(
    `${API_BASE_URL}/events/published`,
    { signal },
  )

  if (!respuesta.ok) {
    throw new Error('No se pudieron cargar los eventos publicados.')
  }

  const datos: unknown = await respuesta.json()

  return eventosPublicadosSchema.parse(datos)
}
