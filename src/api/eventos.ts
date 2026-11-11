import {
  eventosPublicadosSchema,
  type ResumenEvento,
} from './eventos.tipos'
import { http } from './http'

export async function obtenerEventosPublicados(
  signal?: AbortSignal,
): Promise<ResumenEvento[]> {
  const datos = await http('/events/published', { signal })

  return eventosPublicadosSchema.parse(datos)
}
