import {
  detalleEventoSchema,
  eventosPublicadosSchema,
  type DetalleEvento,
  type ResumenEvento,
} from './eventos.tipos'
import { http } from './http'

export async function obtenerEventosPublicados(
  signal?: AbortSignal,
): Promise<ResumenEvento[]> {
  const datos = await http('/events/published', { signal })

  return eventosPublicadosSchema.parse(datos)
}

export async function obtenerEvento(
  eventCode: string,
  signal?: AbortSignal,
): Promise<DetalleEvento> {
  const datos = await http(`/events/${encodeURIComponent(eventCode)}`, { signal })

  return detalleEventoSchema.parse(datos)
}
