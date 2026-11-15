import { usuarioRegistradoSchema, type UsuarioRegistrado } from './auth.tipos'
import { http, validarRespuesta } from './http'

export async function obtenerUsuarioPorCorreo(
  email: string,
  signal?: AbortSignal,
): Promise<UsuarioRegistrado> {
  const parametros = new URLSearchParams({ email })
  const datos = await http(`/users/by-email?${parametros.toString()}`, { signal })

  return validarRespuesta(usuarioRegistradoSchema, datos)
}

export async function obtenerUsuarioPorNombre(
  username: string,
  signal?: AbortSignal,
): Promise<UsuarioRegistrado> {
  const parametros = new URLSearchParams({ username })
  const datos = await http(`/users/by-username?${parametros.toString()}`, { signal })

  return validarRespuesta(usuarioRegistradoSchema, datos)
}
