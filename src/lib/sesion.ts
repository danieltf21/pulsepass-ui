import { sesionGuardadaSchema, type SesionGuardada } from '../api/auth.tipos'

const CLAVE_SESION = 'pulsepass.sesion'

type SesionLeida =
  | { estado: 'ausente' }
  | { estado: 'expirada' }
  | { estado: 'guardada'; datos: SesionGuardada }

export function borrarSesionGuardada(): void {
  try {
    sessionStorage.removeItem(CLAVE_SESION)
  } catch {
    // El navegador puede bloquear el almacenamiento; la sesión en memoria sigue disponible.
  }
}

export function leerSesionGuardada(ahora = Date.now()): SesionLeida {
  try {
    const texto = sessionStorage.getItem(CLAVE_SESION)
    if (texto === null) return { estado: 'ausente' }

    const datos: unknown = JSON.parse(texto)
    const resultado = sesionGuardadaSchema.safeParse(datos)
    if (!resultado.success) {
      borrarSesionGuardada()
      return { estado: 'ausente' }
    }

    if (resultado.data.expiraEn <= ahora) {
      borrarSesionGuardada()
      return { estado: 'expirada' }
    }

    return { estado: 'guardada', datos: resultado.data }
  } catch {
    borrarSesionGuardada()
    return { estado: 'ausente' }
  }
}

export function guardarSesion(datos: SesionGuardada): boolean {
  const validada = sesionGuardadaSchema.parse(datos)
  try {
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(validada))
    return true
  } catch {
    // Permite continuar en memoria si sessionStorage no está disponible.
    return false
  }
}
