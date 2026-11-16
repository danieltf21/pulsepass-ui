import { fireEvent, render, screen } from '@testing-library/react'
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
    estado: 'autenticada', accessToken: 'token-prueba', expiraEn: Date.now() + 60000,
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
  it.each(['STAFF', 'ADMIN'] as const)('muestra enlaces de operación a %s y permite navegar desde el menú', async (rol) => {
    mostrarLayout(sesionConRol(rol))
    expect(screen.queryByRole('link', { name: 'Mis tickets' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'Validar ingreso' }))
    expect(await screen.findByRole('heading', { name: 'Vista de validación' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'Tickets pagados' }))
    expect(await screen.findByRole('heading', { name: 'Buscador de tickets pagados' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Tickets pagados' })).toHaveAttribute('aria-current', 'page')
  })

  it('oculta los enlaces de operación a USER', () => {
    mostrarLayout(sesionConRol('USER'))
    expect(screen.getByRole('link', { name: 'Mis tickets' })).toBeInTheDocument()
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
