import {
  crearEventoSchema,
  detalleEventoSchema,
  eventosPublicadosSchema,
  type CrearEvento,
  type DetalleEvento,
  type ResumenEvento,
} from './eventos.tipos'
import { http, validarRespuesta, validarSolicitud } from './http'

export async function crearEvento(datos: CrearEvento): Promise<DetalleEvento> {
  const evento = validarSolicitud(crearEventoSchema, datos)
  const respuesta = await http('/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evento),
  })

  return validarRespuesta(detalleEventoSchema, respuesta, 201)
}

export async function publicarEvento(eventCode: string): Promise<DetalleEvento> {
  const respuesta = await http(`/events/${encodeURIComponent(eventCode)}/publish`, {
    method: 'PATCH',
  })

  return validarRespuesta(detalleEventoSchema, respuesta)
}

export async function asociarArtistaEvento(eventCode: string, artistId: number): Promise<DetalleEvento> {
  const respuesta = await http(`/events/${encodeURIComponent(eventCode)}/artists/${artistId}`, {
    method: 'POST',
  })

  return validarRespuesta(detalleEventoSchema, respuesta)
}

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
