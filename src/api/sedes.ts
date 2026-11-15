import { sedeSchema, sedesActivasSchema, type Sede } from './sedes.tipos'
import { http, validarRespuesta } from './http'

export async function obtenerSedesActivas(signal?: AbortSignal): Promise<Sede[]> {
  const datos = await http('/venues/active', { signal })

  return validarRespuesta(sedesActivasSchema, datos)
}

export async function obtenerSede(code: string, signal?: AbortSignal): Promise<Sede> {
  const datos = await http(`/venues/${encodeURIComponent(code)}`, { signal })

  return validarRespuesta(sedeSchema, datos)
}
