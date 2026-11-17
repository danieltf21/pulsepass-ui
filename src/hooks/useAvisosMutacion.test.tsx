import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { ReactNode } from 'react'
import type { Sesion } from '../api/auth.tipos'
import { ApiError } from '../api/http'
import { AuthContext } from '../context/AuthContext'
import { obtenerAvisos } from '../lib/avisos'
import { useAvisosMutacion } from './useAvisosMutacion'

const autenticada: Sesion = {
  estado: 'autenticada', accessToken: 'token-prueba', expiraEn: 1900000000000,
  usuario: { id: 1, username: 'prueba', email: 'prueba@example.com', roles: ['USER'] },
}

describe('Avisos de mutación', () => {
  function preparar() {
    let sesion: Sesion = autenticada
    const vista = renderHook(() => useAvisosMutacion('Entrada cancelada.'), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <AuthContext.Provider value={{ sesion, iniciarSesion: async () => {}, cerrarSesion: () => {} }}>{children}</AuthContext.Provider>
      ),
    })
    return { ...vista, cambiarSesion: (siguiente: Sesion) => { sesion = siguiente; vista.rerender() } }
  }

  it('publica éxito y conserva el mensaje esperado de conflicto', () => {
    const { result } = preparar()
    act(() => result.current.exito())
    act(() => result.current.error(new ApiError(409, 'El ticket ya fue utilizado.')))
    expect(obtenerAvisos().map(({ tipo, mensaje }) => ({ tipo, mensaje }))).toEqual([
      { tipo: 'exito', mensaje: 'Entrada cancelada.' },
      { tipo: 'error', mensaje: 'El ticket ya fue utilizado.' },
    ])
  })

  it('omite expiración, anuncia permisos y oculta errores internos inesperados', () => {
    const { result } = preparar()
    act(() => {
      result.current.error(new ApiError(401, 'Sesión expirada'))
    })
    expect(obtenerAvisos()).toHaveLength(0)
    act(() => result.current.error(new ApiError(403, 'Sin permisos')))
    expect(obtenerAvisos()[0]?.mensaje).toBe('Sin permisos')
    act(() => result.current.error(new Error('DETALLE_INTERNO')))
    expect(obtenerAvisos()[1]?.mensaje).toBe('Inténtalo de nuevo en unos momentos.')
  })

  it('ignora callbacks de una sesión cerrada, reemplazada o un componente desmontado', () => {
    const vista = preparar()
    const anterior = vista.result.current
    vista.cambiarSesion({ estado: 'anonima' })
    act(() => { anterior.exito(); anterior.error(new ApiError(409, 'Viejo')) })
    vista.cambiarSesion({ ...autenticada, accessToken: 'otro-token' })
    act(() => anterior.exito())
    const antesDeDesmontar = vista.result.current
    vista.unmount()
    act(() => antesDeDesmontar.error(new ApiError(409, 'Viejo')))
    expect(obtenerAvisos()).toHaveLength(0)
  })
})
