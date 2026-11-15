import { artistaSchema, artistasActivosSchema, type Artista } from './artistas.tipos'
import { http } from './http'

export async function obtenerArtistasActivos(signal?: AbortSignal): Promise<Artista[]> {
  const datos = await http('/artists/active', { signal })

  return artistasActivosSchema.parse(datos)
}

export async function obtenerArtista(id: number, signal?: AbortSignal): Promise<Artista> {
  const datos = await http(`/artists/${id}`, { signal })

  return artistaSchema.parse(datos)
}

export async function obtenerArtistaPorNombre(
  stageName: string,
  signal?: AbortSignal,
): Promise<Artista> {
  const parametros = new URLSearchParams({ stageName })
  const datos = await http(`/artists/by-stage-name?${parametros.toString()}`, { signal })

  return artistaSchema.parse(datos)
}
