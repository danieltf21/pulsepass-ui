import {
  detalleEventoSchema,
  eventosPublicadosSchema,
  type DetalleEvento,
  type ResumenEvento,
} from './eventos.tipos'
import { http, validarRespuesta } from './http'

export async function obtenerEventosPublicados(
  signal?: AbortSignal,
): Promise<ResumenEvento[]> {
  const datos = await http('/events/published', { signal })

  return validarRespuesta(eventosPublicadosSchema, datos)
}

export async function obtenerEvento(
  eventCode: string,
  signal?: AbortSignal,
): Promise<DetalleEvento> {
  const datos = await http(`/events/${encodeURIComponent(eventCode)}`, { signal })

  return validarRespuesta(detalleEventoSchema, datos)
}

export async function obtenerEventosPorArtista(
  stageName: string,
  signal?: AbortSignal,
): Promise<ResumenEvento[]> {
  const parametros = new URLSearchParams({ stageName })
  const datos = await http(`/events/by-artist?${parametros.toString()}`, { signal })

  return validarRespuesta(eventosPublicadosSchema, datos)
}
