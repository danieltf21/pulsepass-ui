import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { iniciarSesion as solicitarLogin, obtenerUsuarioAutenticado } from '../api/auth'
import type { Login, Sesion } from '../api/auth.tipos'
import { ApiError, conectarSesionHttp } from '../api/http'
import { borrarSesionGuardada, guardarSesion, leerSesionGuardada } from '../lib/sesion'
import { AuthContext } from './AuthContext'
import { limpiarAvisos } from '../lib/avisos'

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient()
  const [sesion, setSesion] = useState<Sesion>({ estado: 'cargando' })
  const operacion = useRef(0)
  const tokenActual = useRef<string | null>(null)

  const cerrarSesion = useCallback((motivo?: 'expirada') => {
    limpiarAvisos()
    operacion.current += 1
    tokenActual.current = null
    borrarSesionGuardada()
    queryClient.clear()
    setSesion({ estado: 'anonima', motivo })
  }, [queryClient])

  useEffect(() => conectarSesionHttp({
    obtenerToken: () => tokenActual.current,
    alExpirar: () => cerrarSesion('expirada'),
  }), [cerrarSesion])

  useEffect(() => {
    const actual = ++operacion.current

    async function restaurar() {
      // Permite cancelar la restauración durante el desmontaje de StrictMode.
      await Promise.resolve()
      if (actual !== operacion.current) return
      const guardada = leerSesionGuardada()
      if (guardada.estado !== 'guardada') {
        setSesion({ estado: 'anonima', motivo: guardada.estado === 'expirada' ? 'expirada' : undefined })
        return
      }

      try {
        const usuario = await queryClient.fetchQuery({
          queryKey: ['auth', 'me'],
          queryFn: ({ signal }) => obtenerUsuarioAutenticado(guardada.datos.accessToken, signal),
          staleTime: 0,
          retry: false,
        })
        if (actual !== operacion.current) return
        if (guardada.datos.expiraEn <= Date.now()) {
          cerrarSesion('expirada')
          return
        }
        tokenActual.current = guardada.datos.accessToken
        setSesion({ estado: 'autenticada', usuario, ...guardada.datos })
      } catch (error: unknown) {
        if (actual !== operacion.current) return
        cerrarSesion(error instanceof ApiError && error.status === 401 ? 'expirada' : undefined)
      }
    }

    void restaurar()
    return () => {
      operacion.current += 1
      void queryClient.cancelQueries({ queryKey: ['auth', 'me'] })
    }
  }, [queryClient, cerrarSesion])

  useEffect(() => {
    if (sesion.estado !== 'autenticada') return
    let temporizador: ReturnType<typeof setTimeout>
    function programar() {
      if (sesion.estado !== 'autenticada') return
      const restante = sesion.expiraEn - Date.now()
      if (restante <= 0) {
        cerrarSesion('expirada')
        return
      }
      temporizador = setTimeout(programar, Math.min(restante, 2_147_483_647))
    }
    programar()
    return () => clearTimeout(temporizador)
  }, [sesion, cerrarSesion])

  async function iniciarSesion(credenciales: Login): Promise<void> {
    const actual = ++operacion.current
    const inicio = Date.now()
    const respuesta = await solicitarLogin(credenciales)
    if (actual !== operacion.current) return

    await queryClient.cancelQueries({ queryKey: ['auth', 'me'] })
    queryClient.clear()
    borrarSesionGuardada()
    try {
      const usuario = await queryClient.fetchQuery({
        queryKey: ['auth', 'me'],
        queryFn: ({ signal }) => obtenerUsuarioAutenticado(respuesta.accessToken, signal),
        staleTime: 0,
        retry: false,
      })
      if (actual !== operacion.current) return
      const expiraEn = inicio + respuesta.expiresIn * 1000
      if (expiraEn <= Date.now()) throw new ApiError(401, 'Tu sesión expiró. Inicia sesión de nuevo.')
      guardarSesion({ accessToken: respuesta.accessToken, expiraEn })
      tokenActual.current = respuesta.accessToken
      setSesion({ estado: 'autenticada', usuario, accessToken: respuesta.accessToken, expiraEn })
    } catch (error: unknown) {
      if (actual === operacion.current) cerrarSesion()
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ sesion, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  )
}
