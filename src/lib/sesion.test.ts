import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { borrarSesionGuardada, guardarSesion, leerSesionGuardada } from './sesion'

const ahora = 1_800_000_000_000
const datos = { accessToken: 'token-ficticio-de-prueba', expiraEn: ahora + 60_000 }

beforeEach(() => sessionStorage.clear())
afterEach(() => sessionStorage.clear())

describe('Persistencia de sesión', () => {
  it('guarda y restaura una sesión vigente usando el instante proporcionado', () => {
    expect(guardarSesion(datos)).toBe(true)
    expect(leerSesionGuardada(ahora)).toEqual({ estado: 'guardada', datos })
    expect(localStorage.getItem('pulsepass.sesion')).toBeNull()
  })

  it('borra la sesión al llegar exactamente a su expiración', () => {
    guardarSesion(datos)

    expect(leerSesionGuardada(datos.expiraEn)).toEqual({ estado: 'expirada' })
    expect(sessionStorage.getItem('pulsepass.sesion')).toBeNull()
  })

  it.each(['{json corrupto', '{}', '{"accessToken":123,"expiraEn":1800000060000}',
    '{"accessToken":"","expiraEn":1800000060000}', '{"accessToken":"prueba","expiraEn":"mañana"}'])(
    'descarta datos inválidos: %s', (texto) => {
      sessionStorage.setItem('pulsepass.sesion', texto)

      expect(leerSesionGuardada(ahora)).toEqual({ estado: 'ausente' })
      expect(sessionStorage.getItem('pulsepass.sesion')).toBeNull()
    },
  )

  it('borra el token al cerrar la sesión', () => {
    guardarSesion(datos)
    borrarSesionGuardada()

    expect(leerSesionGuardada(ahora)).toEqual({ estado: 'ausente' })
  })

  it('permite continuar en memoria si no se puede guardar en la pestaña', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Bloqueado', 'SecurityError') })

    expect(guardarSesion(datos)).toBe(false)
  })

  it('no rompe el arranque si no se puede leer el almacenamiento', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('Bloqueado', 'SecurityError') })

    expect(leerSesionGuardada(ahora)).toEqual({ estado: 'ausente' })
  })
})
