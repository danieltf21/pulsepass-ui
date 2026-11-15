import { render, screen } from '@testing-library/react'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { describe, expect, it, vi } from 'vitest'
import type { Rol, Sesion } from '../api/auth.tipos'
import { AuthContext } from '../context/AuthContext'
import RutaProtegida from './RutaProtegida'
import RutaPorRol from './RutaPorRol'
import SoloAnonimo from './SoloAnonimo'

function sesionConRol(rol: Rol): Sesion {
  return {
    estado: 'autenticada',
    accessToken: 'token-ficticio',
    expiraEn: 2_000_000_000_000,
    usuario: { id: 1, username: 'prueba', email: 'prueba@example.com', roles: [rol] },
  }
}

function mostrarGuarda(sesion: Sesion, tipo: 'protegida' | 'rol' | 'anonima', entrada = '/privada') {
  const router = createMemoryRouter([
    {
      element: tipo === 'protegida' ? <RutaProtegida /> : tipo === 'rol'
        ? <RutaPorRol roles={['STAFF', 'ADMIN']} /> : <SoloAnonimo />,
      children: [{ path: '/privada', element: <h1>Contenido permitido</h1> }],
    },
    { path: '/login', element: <h1>Formulario de login</h1> },
    { path: '/403', element: <h1>Acceso denegado</h1> },
    { path: '/', element: <h1>Inicio</h1> },
  ], { initialEntries: [entrada] })
  render(
    <AuthContext.Provider value={{ sesion, iniciarSesion: vi.fn(), cerrarSesion: vi.fn() }}>
      <RouterProvider router={router} />
    </AuthContext.Provider>,
  )
  return router
}

describe('Guardas de rutas', () => {
  it('redirige al anónimo conservando URL completa y motivo de expiración', async () => {
    const router = mostrarGuarda({ estado: 'anonima', motivo: 'expirada' }, 'protegida', '/privada?q=musica#tickets')

    expect(await screen.findByRole('heading', { name: 'Formulario de login' })).toBeInTheDocument()
    expect(router.state.location.state).toEqual({ desde: '/privada?q=musica#tickets', motivo: 'expirada' })
  })

  it('espera la restauración sin mostrar contenido protegido ni redirigir', () => {
    const router = mostrarGuarda({ estado: 'cargando' }, 'protegida')

    expect(screen.getByRole('status')).toHaveTextContent('Comprobando sesión')
    expect(screen.queryByRole('heading', { name: 'Contenido permitido' })).not.toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/privada')
  })

  it('permite a USER entrar a una ruta que solo requiere sesión', () => {
    mostrarGuarda(sesionConRol('USER'), 'protegida')

    expect(screen.getByRole('heading', { name: 'Contenido permitido' })).toBeInTheDocument()
  })

  it('rechaza a USER en una ruta reservada para STAFF o ADMIN', async () => {
    mostrarGuarda(sesionConRol('USER'), 'rol')

    expect(await screen.findByRole('heading', { name: 'Acceso denegado' })).toBeInTheDocument()
  })

  it.each(['STAFF', 'ADMIN'] as const)('permite el rol autorizado %s', (rol) => {
    mostrarGuarda(sesionConRol(rol), 'rol')

    expect(screen.getByRole('heading', { name: 'Contenido permitido' })).toBeInTheDocument()
  })

  it('no deja pasar un anónimo por la guarda de roles', async () => {
    mostrarGuarda({ estado: 'anonima' }, 'rol')

    expect(await screen.findByRole('heading', { name: 'Formulario de login' })).toBeInTheDocument()
  })

  it('permite al anónimo entrar al formulario público', () => {
    mostrarGuarda({ estado: 'anonima' }, 'anonima')

    expect(screen.getByRole('heading', { name: 'Contenido permitido' })).toBeInTheDocument()
  })

  it('SoloAnonimo redirige al inicio cuando existe una sesión', async () => {
    mostrarGuarda(sesionConRol('USER'), 'anonima')

    expect(await screen.findByRole('heading', { name: 'Inicio' })).toBeInTheDocument()
  })
})
