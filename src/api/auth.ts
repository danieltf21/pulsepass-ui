import {
  loginSchema,
  respuestaLoginSchema,
  usuarioAutenticadoSchema,
  type Login,
  type RespuestaLogin,
  type UsuarioAutenticado,
} from './auth.tipos'
import { ApiError, http, validarRespuesta } from './http'

export async function iniciarSesion(datos: Login, signal?: AbortSignal): Promise<RespuestaLogin> {
  const credenciales = loginSchema.parse(datos)
  let respuesta: unknown

  try {
    respuesta = await http('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credenciales),
      signal,
    })
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 401) {
      throw new ApiError(401, 'Credenciales inválidas')
    }
    throw error
  }

  return validarRespuesta(respuestaLoginSchema, respuesta)
}

export async function obtenerUsuarioAutenticado(
  accessToken: string,
  signal?: AbortSignal,
): Promise<UsuarioAutenticado> {
  const respuesta = await http('/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal,
  })

  return validarRespuesta(usuarioAutenticadoSchema, respuesta)
}
