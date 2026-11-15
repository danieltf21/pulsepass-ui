import { sedeSchema, sedesActivasSchema, type Sede } from './sedes.tipos'
import { http } from './http'

export async function obtenerSedesActivas(signal?: AbortSignal): Promise<Sede[]> {
  const datos = await http('/venues/active', { signal })

  return sedesActivasSchema.parse(datos)
}

export async function obtenerSede(code: string, signal?: AbortSignal): Promise<Sede> {
  const datos = await http(`/venues/${encodeURIComponent(code)}`, { signal })

  return sedeSchema.parse(datos)
}
