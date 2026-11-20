import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import type { Rol, Sesion } from '../api/auth.tipos'
import { AuthContext } from '../context/AuthContext'
import { RUTAS } from '../lib/rutas'
import Layout from './Layout'
import RutaProtegida from './RutaProtegida'
import RutaPorRol from './RutaPorRol'

function sesionConRol(rol: Rol): Sesion {
  return {
    estado: 'autenticada', accessToken: 'token-prueba', expiraEn: 1_800_000_060_000,
    usuario: { id: 2, username: 'operador', email: 'operador@example.com', roles: [rol] },
  }
}

function mostrarLayout(sesion: Sesion, entrada: string = RUTAS.inicio) {
  const router = createMemoryRouter([{
    Component: Layout,
    children: [
      { index: true, element: <h1>Página inicial</h1> },
      { path: RUTAS.login, element: <h1>Formulario de login</h1> },
      { path: RUTAS.sinPermisos, element: <h1>Acceso denegado</h1> },
      {
        Component: RutaProtegida,
        children: [{
          element: <RutaPorRol roles={['ADMIN']} />,
          children: [RUTAS.adminEventos, RUTAS.adminCrearEvento, RUTAS.adminGestionEvento].map((path) => ({
            path, element: <h1>Contenido ADMIN</h1>,
          })),
        }],
      },
      {
        Component: RutaProtegida,
        children: [{
          element: <RutaPorRol roles={['STAFF', 'ADMIN']} />,
          children: [
            { path: RUTAS.validacionIngreso, element: <h1>Vista de validación</h1> },
            { path: RUTAS.buscarTicketsPagados, element: <h1>Buscador de tickets pagados</h1> },
            { path: RUTAS.ticketsPagados, element: <h1>Entradas del evento</h1> },
          ],
        }],
      },
    ],
  }], { initialEntries: [entrada] })
  render(
    <AuthContext.Provider value={{ sesion, iniciarSesion: vi.fn(), cerrarSesion: vi.fn() }}>
      <RouterProvider router={router} />
    </AuthContext.Provider>,
  )
  return router
}

describe('Menú y acceso STAFF', () => {
  it('mantiene el menú cerrado al navegar externamente y regresar con Atrás', async () => {
    const usuario = userEvent.setup()
    const router = mostrarLayout(sesionConRol('ADMIN'))
    await usuario.click(screen.getByRole('button', { name: 'Abrir menú' }))
    await act(async () => { await router.navigate(RUTAS.adminEventos) })
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute('aria-expanded', 'false')
    await act(async () => { await router.navigate(-1) })
    expect(await screen.findByRole('heading', { name: 'Página inicial' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('abre y cierra el menú con teclado y devuelve el foco al pulsar Escape', async () => {
    const usuario = userEvent.setup()
    mostrarLayout(sesionConRol('ADMIN'))
    const boton = screen.getByRole('button', { name: 'Abrir menú' })
    const navegacion = screen.getByRole('navigation', { name: 'Navegación principal' })
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    expect(boton).toHaveAttribute('aria-controls', navegacion.id)
    expect(navegacion).toHaveClass('hidden')

    boton.focus()
    await usuario.keyboard('{Enter}')
    expect(boton).toHaveAccessibleName('Cerrar menú')
    expect(boton).toHaveAttribute('aria-expanded', 'true')
    expect(navegacion).not.toHaveClass('hidden')
    await usuario.tab()
    expect(screen.getByRole('link', { name: 'Eventos' })).toHaveFocus()
    await usuario.keyboard('{Escape}')
    expect(boton).toHaveFocus()
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    expect(navegacion).toHaveClass('hidden')
  })

  it('cierra el menú al elegir un enlace incluso hacia la página actual', async () => {
    const usuario = userEvent.setup()
    mostrarLayout(sesionConRol('ADMIN'), RUTAS.adminEventos)
    await usuario.click(screen.getByRole('button', { name: 'Abrir menú' }))
    await usuario.click(screen.getByRole('link', { name: 'Administrar eventos' }))
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute('aria-expanded', 'false')

    expect(screen.queryByRole('link', { name: 'Inicio' })).not.toBeInTheDocument()
    await usuario.click(screen.getByRole('link', { name: 'PulsePass' }))
    expect(await screen.findByRole('heading', { name: 'Página inicial' })).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Abrir menú' }))
    await usuario.click(screen.getByRole('link', { name: 'Administrar eventos' }))
    expect(await screen.findByRole('heading', { name: 'Contenido ADMIN' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('permite cerrar el menú desde su botón', async () => {
    const usuario = userEvent.setup()
    mostrarLayout({ estado: 'anonima' })
    await usuario.click(screen.getByRole('button', { name: 'Abrir menú' }))
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Cerrar menú' }))
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('permite navegar al módulo ADMIN desde el menú de ADMIN', async () => {
    mostrarLayout(sesionConRol('ADMIN'))
    fireEvent.click(screen.getByRole('link', { name: 'Administrar eventos' }))
    expect(await screen.findByRole('heading', { name: 'Contenido ADMIN' })).toBeInTheDocument()
  })

  it.each(['USER', 'STAFF'] as const)('oculta administración y rechaza su acceso para %s', async (rol) => {
    mostrarLayout(sesionConRol(rol), RUTAS.adminCrearEvento)
    expect(await screen.findByRole('heading', { name: 'Acceso denegado' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Administrar eventos' })).not.toBeInTheDocument()
  })

  it.each(['STAFF', 'ADMIN'] as const)('muestra enlaces de operación a %s y permite navegar desde el menú', async (rol) => {
    mostrarLayout(sesionConRol(rol))
    expect(screen.queryByRole('link', { name: 'Mis tickets' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'Validar ingreso' }))
    expect(await screen.findByRole('heading', { name: 'Vista de validación' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'Tickets pagados' }))
    expect(await screen.findByRole('heading', { name: 'Buscador de tickets pagados' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Tickets pagados' })).toHaveAttribute('aria-current', 'page')
  })

  it('muestra Mis tickets solo en el menú de cuenta de USER y oculta los enlaces de operación', async () => {
    const usuario = userEvent.setup()
    mostrarLayout(sesionConRol('USER'))
    await usuario.click(screen.getByText('operador', { exact: true }))
    const enlace = screen.getByRole('link', { name: 'Mis tickets' })
    expect(enlace.closest('details')).toHaveAttribute('open')
    expect(enlace).toHaveAttribute('href', RUTAS.misTickets)
    expect(screen.queryByRole('link', { name: 'Validar ingreso' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Tickets pagados' })).not.toBeInTheDocument()
  })

  it('oculta enlaces privados a visitantes', () => {
    mostrarLayout({ estado: 'anonima' })
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Validar ingreso' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Tickets pagados' })).not.toBeInTheDocument()
  })

  it('mantiene Tickets pagados activo al consultar un evento concreto', () => {
    mostrarLayout(sesionConRol('STAFF'), RUTAS.ticketsPagadosEvento('CMF-2026'))
    expect(screen.getByRole('link', { name: 'Tickets pagados' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Validar ingreso' })).not.toHaveAttribute('aria-current')
  })

  it.each([RUTAS.validacionIngreso, RUTAS.ticketsPagadosEvento('CMF-2026')])('redirige a USER a 403 en %s', async (ruta) => {
    mostrarLayout(sesionConRol('USER'), ruta)
    expect(await screen.findByRole('heading', { name: 'Acceso denegado' })).toBeInTheDocument()
  })

  it('envía al visitante a login conservando el destino STAFF', async () => {
    const destino = `${RUTAS.ticketsPagadosEvento('CMF-2026')}?vista=puerta#entradas`
    const router = mostrarLayout({ estado: 'anonima' }, destino)
    expect(await screen.findByRole('heading', { name: 'Formulario de login' })).toBeInTheDocument()
    expect(router.state.location.state.desde).toBe(destino)
  })
})
