import { useEffect, useRef } from 'react'
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { asociarArtistaEvento, crearEvento, obtenerEvento, obtenerEventosPorArtista, obtenerEventosPublicados, publicarEvento } from '../api/eventos'
import type { CrearEvento, DetalleEvento } from '../api/eventos.tipos'
import { ApiError } from '../api/http'
import { useAuth } from './useAuth'

function reintentarConsulta(intentosFallidos: number, error: Error): boolean {
  if (!(error instanceof ApiError)) return false

  const esErrorDeRed = error.status === 0
  const esErrorDelServidor = error.status >= 500 && error.status < 600

  return intentosFallidos < 1 && (esErrorDeRed || esErrorDelServidor)
}

export function useEventos(habilitado = true) {
  return useQuery({
    queryKey: ['eventos', 'publicados'],
    queryFn: ({ signal }) => obtenerEventosPublicados(signal),
    enabled: habilitado,
    retry: reintentarConsulta,
  })
}

export function useEvento(eventCode: string) {
  return useQuery({
    queryKey: ['evento', eventCode],
    queryFn: ({ signal }) => obtenerEvento(eventCode, signal),
    enabled: eventCode.trim().length > 0,
    retry: reintentarConsulta,
  })
}

export function useEventosPorArtista(stageName: string) {
  return useQuery({
    queryKey: ['eventos', 'artista', stageName],
    queryFn: ({ signal }) => obtenerEventosPorArtista(stageName, signal),
    enabled: stageName.trim().length > 0,
    retry: reintentarConsulta,
  })
}

export function useCrearEvento() {
  const { sesion } = useAuth()
  const queryClient = useQueryClient()
  const sesionActual = useRef(sesion)
  useEffect(() => {
    sesionActual.current = sesion
    return () => { sesionActual.current = { estado: 'anonima' } }
  }, [sesion])

  return useMutation({
    mutationFn: (datos: CrearEvento) => {
      if (sesion.estado !== 'autenticada') {
        throw new ApiError(401, 'Debes iniciar sesión para crear un evento.')
      }
      if (!sesion.usuario.roles.includes('ADMIN')) {
        throw new ApiError(403, 'Tu cuenta no tiene permisos para crear eventos.')
      }
      return crearEvento(datos)
    },
    retry: false,
    onSuccess: async (evento) => {
      const actual = sesionActual.current
      if (sesion.estado !== 'autenticada' || actual.estado !== 'autenticada'
        || actual.accessToken !== sesion.accessToken || actual.usuario.id !== sesion.usuario.id) return

      const clave = ['evento', evento.eventCode]
      await queryClient.cancelQueries({ queryKey: clave, exact: true })
      const trasCancelar = sesionActual.current
      if (trasCancelar.estado !== 'autenticada' || trasCancelar.accessToken !== sesion.accessToken
        || trasCancelar.usuario.id !== sesion.usuario.id) return

      queryClient.setQueryData(clave, evento)
      const claveCreados = ['eventos', 'creados', sesion.usuario.id]
      queryClient.setQueryDefaults(claveCreados, { gcTime: Infinity })
      queryClient.setQueryData<DetalleEvento[]>(claveCreados, (eventos = []) =>
        [evento, ...eventos.filter((anterior) => anterior.eventCode !== evento.eventCode)],
      )
    },
  })
}

export function useEventosCreados() {
  const { sesion } = useAuth()
  return useQuery<DetalleEvento[]>({
    queryKey: ['eventos', 'creados', sesion.estado === 'autenticada' ? sesion.usuario.id : null],
    queryFn: skipToken,
    initialData: [],
    gcTime: Infinity,
  })
}

export function usePublicarEvento(eventCode: string) {
  const { sesion } = useAuth()
  const queryClient = useQueryClient()
  const sesionActual = useRef(sesion)
  useEffect(() => {
    sesionActual.current = sesion
    return () => { sesionActual.current = { estado: 'anonima' } }
  }, [sesion])

  return useMutation({
    mutationFn: () => {
      if (sesion.estado !== 'autenticada') {
        throw new ApiError(401, 'Debes iniciar sesión para publicar un evento.')
      }
      if (!sesion.usuario.roles.includes('ADMIN')) {
        throw new ApiError(403, 'Tu cuenta no tiene permisos para publicar eventos.')
      }
      if (!eventCode.trim()) {
        throw new ApiError(400, 'El código del evento no es válido.')
      }
      return publicarEvento(eventCode)
    },
    retry: false,
    onSuccess: async (evento) => {
      const actual = sesionActual.current
      if (sesion.estado !== 'autenticada' || actual.estado !== 'autenticada'
        || actual.accessToken !== sesion.accessToken || actual.usuario.id !== sesion.usuario.id) return

      const clave = ['evento', evento.eventCode]
      await queryClient.cancelQueries({ queryKey: clave, exact: true })
      const trasCancelar = sesionActual.current
      if (trasCancelar.estado !== 'autenticada' || trasCancelar.accessToken !== sesion.accessToken
        || trasCancelar.usuario.id !== sesion.usuario.id) return

      queryClient.setQueryData(clave, evento)
      queryClient.setQueryData<DetalleEvento[]>(['eventos', 'creados', sesion.usuario.id], (eventos) =>
        eventos?.map((anterior) => anterior.eventCode === evento.eventCode ? evento : anterior),
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: clave, exact: true }),
        queryClient.invalidateQueries({ queryKey: ['eventos', 'publicados'] }),
        queryClient.invalidateQueries({ queryKey: ['eventos', 'artista'] }),
      ])
    },
  })
}

export function useAsociarArtista(eventCode: string) {
  const { sesion } = useAuth()
  const queryClient = useQueryClient()
  const sesionActual = useRef(sesion)
  useEffect(() => {
    sesionActual.current = sesion
    return () => { sesionActual.current = { estado: 'anonima' } }
  }, [sesion])

  return useMutation({
    mutationFn: (artistId: number) => {
      if (sesion.estado !== 'autenticada') {
        throw new ApiError(401, 'Debes iniciar sesión para asociar un artista.')
      }
      if (!sesion.usuario.roles.includes('ADMIN')) {
        throw new ApiError(403, 'Tu cuenta no tiene permisos para asociar artistas.')
      }
      if (!eventCode.trim() || !Number.isSafeInteger(artistId) || artistId <= 0) {
        throw new ApiError(400, 'El código del evento o el identificador del artista no es válido.')
      }
      return asociarArtistaEvento(eventCode, artistId)
    },
    retry: false,
    onSuccess: async (evento) => {
      const actual = sesionActual.current
      if (sesion.estado !== 'autenticada' || actual.estado !== 'autenticada'
        || actual.accessToken !== sesion.accessToken || actual.usuario.id !== sesion.usuario.id) return

      const clave = ['evento', evento.eventCode]
      await queryClient.cancelQueries({ queryKey: clave, exact: true })
      const trasCancelar = sesionActual.current
      if (trasCancelar.estado !== 'autenticada' || trasCancelar.accessToken !== sesion.accessToken
        || trasCancelar.usuario.id !== sesion.usuario.id) return

      queryClient.setQueryData(clave, evento)
      queryClient.setQueryData<DetalleEvento[]>(['eventos', 'creados', sesion.usuario.id], (eventos) =>
        eventos?.map((anterior) => anterior.eventCode === evento.eventCode ? evento : anterior),
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: clave, exact: true }),
        queryClient.invalidateQueries({ queryKey: ['eventos', 'publicados'] }),
        queryClient.invalidateQueries({ queryKey: ['eventos', 'artista'] }),
      ])
    },
  })
}
