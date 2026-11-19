import {
  loginSchema,
  registroSchema,
  respuestaLoginSchema,
  usuarioAutenticadoSchema,
  usuarioRegistradoSchema,
  type Login,
  type Registro,
  type RespuestaLogin,
  type UsuarioAutenticado,
  type UsuarioRegistrado,
} from './auth.tipos'
import { ApiError, http, validarRespuesta, validarSolicitud } from './http'

export async function registrarUsuario(
  datos: Registro,
  signal?: AbortSignal,
): Promise<UsuarioRegistrado> {
  const registro = validarSolicitud(registroSchema, datos)
  let respuesta: unknown

  try {
    respuesta = await http('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registro),
      signal,
    })
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 409) {
      throw new ApiError(409, 'No se pudo crear la cuenta. El usuario o correo ya está registrado.')
    }
    throw error
  }

  return validarRespuesta(usuarioRegistradoSchema, respuesta, 201)
}

export async function iniciarSesion(datos: Login, signal?: AbortSignal): Promise<RespuestaLogin> {
  const credenciales = validarSolicitud(loginSchema, datos)
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
