import { useAvisosMutacion } from './useAvisosMutacion'
import { useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UsuarioAutenticado } from '../api/auth.tipos'
import { obtenerEvento } from '../api/eventos'
import { ApiError } from '../api/http'
import {
  cancelarTicket, comprarTicket, marcarTicketUsado, obtenerTicket,
  obtenerTicketsPorUsuario, obtenerTicketsPagadosPorEvento,
} from '../api/tickets'
import type { FormularioCompra, Ticket } from '../api/tickets.tipos'
import { reintentarConsulta } from './reintentarConsulta'
import { useAuth } from './useAuth'

export function useComprarTicket(eventCode: string) {
  const avisos = useAvisosMutacion('Compra realizada. Consulta tu entrada en la confirmación.')
  const { sesion } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ type }: FormularioCompra) => {
      if (sesion.estado !== 'autenticada') {
        throw new ApiError(401, 'Debes iniciar sesión para comprar una entrada.')
      }
      if (!sesion.usuario.roles.includes('USER')) {
        throw new ApiError(403, 'Tu cuenta no tiene permisos para comprar entradas.')
      }

      return comprarTicket({ userEmail: sesion.usuario.email, eventCode, type })
    },
    retry: false,
    onError: avisos.error,
    onSuccess: async (ticket) => {
      // Una compra iniciada antes de salir no debe repoblar la caché de otra sesión.
      const usuarioActual = queryClient.getQueryData<UsuarioAutenticado>(['auth', 'me'])
      if (sesion.estado !== 'autenticada' || usuarioActual?.id !== sesion.usuario.id) return

      queryClient.setQueryData(['ticket', ticket.ticketCode], ticket)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tickets', 'usuario', sesion.usuario.email] }),
        queryClient.invalidateQueries({ queryKey: ['evento', eventCode] }),
        queryClient.invalidateQueries({ queryKey: ['eventos', 'publicados'] }),
      ])
      avisos.exito()
    },
  })
}

export function useTicket(ticketCode: string) {
  const { sesion } = useAuth()

  return useQuery({
    queryKey: ['ticket', ticketCode],
    queryFn: ({ signal }) => obtenerTicket(ticketCode, signal),
    enabled: sesion.estado === 'autenticada' && ticketCode.trim().length > 0,
    refetchInterval: (consulta) => sesion.estado === 'autenticada' && sesion.usuario.roles.includes('USER')
      && consulta.state.status === 'success' ? 5000 : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: 'always',
    retry: reintentarConsulta,
  })
}

export function useMisTickets() {
  const { sesion } = useAuth()
  const email = sesion.estado === 'autenticada' ? sesion.usuario.email : ''

  return useQuery({
    queryKey: ['tickets', 'usuario', email],
    queryFn: ({ signal }) => {
      // También protege una llamada manual a refetch cuando la consulta está deshabilitada.
      if (sesion.estado !== 'autenticada') {
        throw new ApiError(401, 'Debes iniciar sesión para consultar tus entradas.')
      }
      if (!sesion.usuario.roles.includes('USER')) {
        throw new ApiError(403, 'Tu cuenta no tiene permisos para consultar Mis tickets.')
      }
      return obtenerTicketsPorUsuario(email, signal)
    },
    enabled: sesion.estado === 'autenticada' && sesion.usuario.roles.includes('USER'),
    refetchInterval: (consulta) => consulta.state.status === 'success' ? 5000 : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: 'always',
    retry: reintentarConsulta,
  })
}

export function useCancelarTicket(ticketCode: string) {
  const avisos = useAvisosMutacion('La entrada se canceló correctamente.')
  const { sesion } = useAuth()
  const queryClient = useQueryClient()
  const sesionActual = useRef(sesion)
  useEffect(() => { sesionActual.current = sesion }, [sesion])

  return useMutation({
    mutationFn: () => {
      if (sesion.estado !== 'autenticada') {
        throw new ApiError(401, 'Debes iniciar sesión para cancelar una entrada.')
      }
      if (!sesion.usuario.roles.includes('USER')) {
        throw new ApiError(403, 'Tu cuenta no tiene permisos para cancelar entradas.')
      }
      if (!ticketCode.trim()) {
        throw new ApiError(400, 'El código de la entrada no es válido.')
      }
      return cancelarTicket(ticketCode)
    },
    retry: false,
    onError: avisos.error,
    onSuccess: async (ticket) => {
      const actual = sesionActual.current
      if (sesion.estado !== 'autenticada' || actual.estado !== 'autenticada'
        || actual.accessToken !== sesion.accessToken || actual.usuario.id !== sesion.usuario.id) return

      // Evita que una consulta anterior sobrescriba el estado recién cancelado.
      const claveListado = ['tickets', 'usuario', sesion.usuario.email]
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['ticket', ticketCode], exact: true }),
        queryClient.cancelQueries({ queryKey: claveListado, exact: true }),
      ])
      const trasCancelar = sesionActual.current
      if (trasCancelar.estado !== 'autenticada' || trasCancelar.accessToken !== sesion.accessToken
        || trasCancelar.usuario.id !== sesion.usuario.id) return

      queryClient.setQueryData(['ticket', ticketCode], ticket)
      queryClient.setQueryData<Ticket[]>(claveListado, (entradas) =>
        entradas?.map((entrada) => entrada.ticketCode === ticketCode ? ticket : entrada),
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tickets', 'usuario', sesion.usuario.email] }),
        queryClient.invalidateQueries({ queryKey: ['evento', ticket.eventCode] }),
        queryClient.invalidateQueries({ queryKey: ['eventos', 'publicados'] }),
      ])
      avisos.exito()
    },
  })
}

export function useMarcarTicketUsado(ticketCode: string) {
  const avisos = useAvisosMutacion('Ingreso registrado.')
  const { sesion } = useAuth()
  const queryClient = useQueryClient()
  const sesionActual = useRef(sesion)
  useEffect(() => { sesionActual.current = sesion }, [sesion])

  return useMutation({
    mutationFn: () => {
      if (sesion.estado !== 'autenticada') {
        throw new ApiError(401, 'Debes iniciar sesión para registrar el ingreso.')
      }
      if (!sesion.usuario.roles.some((rol) => rol === 'STAFF' || rol === 'ADMIN')) {
        throw new ApiError(403, 'Tu cuenta no tiene permisos para registrar el ingreso.')
      }
      if (!ticketCode.trim()) {
        throw new ApiError(400, 'El código de la entrada no es válido.')
      }
      return marcarTicketUsado(ticketCode)
    },
    retry: false,
    onError: avisos.error,
    onSuccess: async (ticket) => {
      const actual = sesionActual.current
      if (sesion.estado !== 'autenticada' || actual.estado !== 'autenticada'
        || actual.accessToken !== sesion.accessToken || actual.usuario.id !== sesion.usuario.id) return

      const clavePropios = ['tickets', 'usuario', ticket.userEmail]
      const clavePagados = ['tickets', 'pagados', ticket.eventCode]
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['ticket', ticketCode], exact: true }),
        queryClient.cancelQueries({ queryKey: clavePropios, exact: true }),
        queryClient.cancelQueries({ queryKey: clavePagados, exact: true }),
      ])
      const trasCancelarConsultas = sesionActual.current
      if (trasCancelarConsultas.estado !== 'autenticada'
        || trasCancelarConsultas.accessToken !== sesion.accessToken
        || trasCancelarConsultas.usuario.id !== sesion.usuario.id) return

      queryClient.setQueryData(['ticket', ticketCode], ticket)
      queryClient.setQueryData<Ticket[]>(clavePropios, (entradas) =>
        entradas?.map((entrada) => entrada.ticketCode === ticketCode ? ticket : entrada),
      )
      queryClient.setQueryData<Ticket[]>(clavePagados, (entradas) =>
        entradas?.filter((entrada) => entrada.ticketCode !== ticketCode),
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: clavePropios }),
        queryClient.invalidateQueries({ queryKey: clavePagados }),
      ])
      avisos.exito()
    },
  })
}

export function useTicketsPagadosPorEvento(eventCode: string) {
  const { sesion } = useAuth()
  const codigo = eventCode.trim()
  const tienePermiso = sesion.estado === 'autenticada'
    && sesion.usuario.roles.some((rol) => rol === 'STAFF' || rol === 'ADMIN')

  return useQuery({
    queryKey: ['tickets', 'pagados', codigo],
    queryFn: async ({ signal }) => {
      if (sesion.estado !== 'autenticada') {
        throw new ApiError(401, 'Debes iniciar sesión para consultar las entradas pagadas.')
      }
      if (!tienePermiso) {
        throw new ApiError(403, 'Tu cuenta no tiene permisos para consultar las entradas pagadas.')
      }
      if (!codigo) {
        throw new ApiError(400, 'El código del evento no es válido.')
      }
      const entradas = await obtenerTicketsPagadosPorEvento(codigo, signal)
      // La API devuelve una lista vacía también cuando el evento no existe.
      if (entradas.length === 0) await obtenerEvento(codigo, signal)
      return entradas
    },
    enabled: tienePermiso && codigo.length > 0,
    retry: reintentarConsulta,
  })
}
