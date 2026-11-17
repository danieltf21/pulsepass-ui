import { useEffect, useRef } from 'react'
import { ApiError } from '../api/http'
import { mostrarAviso } from '../lib/avisos'
import { useAuth } from './useAuth'

export function useAvisosMutacion(mensajeExito: string) {
  const { sesion } = useAuth()
  const actual = useRef(sesion)
  useEffect(() => {
    actual.current = sesion
    return () => { actual.current = { estado: 'cargando' } }
  }, [sesion])

  function vigente() {
    return sesion.estado === 'autenticada'
      ? actual.current.estado === 'autenticada' && actual.current.accessToken === sesion.accessToken
      : sesion.estado === 'anonima' && actual.current.estado === 'anonima'
  }

  return {
    exito: () => { if (vigente()) mostrarAviso('exito', mensajeExito) },
    error: (error: Error) => {
      // Un 401 autenticado ya anuncia la expiración desde el flujo de sesión.
      if (!vigente() || (sesion.estado === 'autenticada' && error instanceof ApiError && error.status === 401)) return
      mostrarAviso('error', error instanceof ApiError ? error.message : 'Inténtalo de nuevo en unos momentos.')
    },
  }
}
