import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import type { Sesion } from '../api/auth.tipos'
import { AuthContext } from '../context/AuthContext'
import { server } from '../test/mocks/server'
import { eventosPublicadosDePrueba } from '../test/mocks/handlers'
import Inicio from './Inicio'

function mostrarInicio(sesion: Sesion = { estado: 'anonima' }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthContext.Provider value={{ sesion, iniciarSesion: async () => {}, cerrarSesion: () => {} }}>
          <Inicio />
        </AuthContext.Provider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Inicio', () => {
  it('ofrece Crear cuenta al visitante y enlaza al registro', () => {
    mostrarInicio()
    expect(screen.getByRole('link', { name: 'Crear cuenta' })).toHaveAttribute('href', '/registro')
  })

  it('oculta Crear cuenta con sesión iniciada y conserva Ver cartelera', () => {
    mostrarInicio({
      estado: 'autenticada', accessToken: 'token-prueba', expiraEn: 2_000_000_000_000,
      usuario: { id: 1, username: 'andrea', email: 'andrea@example.com', roles: ['USER'] },
    })
    expect(screen.queryByRole('link', { name: 'Crear cuenta' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver cartelera' })).toHaveAttribute('href', '/eventos')
  })

  it('muestra el estado vacío cuando la API no devuelve eventos', async () => {
    server.use(http.get('*/api/events/published', () => HttpResponse.json([])))
    mostrarInicio()

    expect(await screen.findByText('Aún no hay eventos publicados.')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Ver detalle de/ })).not.toBeInTheDocument()
  })

  it('muestra un error con opción de reintento cuando falla la API', async () => {
    server.use(http.get('*/api/events/published', () => new HttpResponse(null, { status: 500 })))
    mostrarInicio()

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar los próximos eventos.')
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeEnabled()
  })

  it('presenta únicamente los primeros tres eventos de la respuesta', async () => {
    const eventos = Array.from({ length: 4 }, (_, indice) => ({
      ...eventosPublicadosDePrueba[0],
      eventCode: `EVENTO-${indice + 1}`,
      name: `Evento ${indice + 1}`,
    }))
    server.use(http.get('*/api/events/published', () => HttpResponse.json(eventos)))
    mostrarInicio()

    await screen.findByRole('heading', { name: 'Evento 1' })
    expect(screen.getAllByRole('link', { name: /Ver detalle de/ })).toHaveLength(3)
    expect(screen.getByRole('heading', { name: 'Evento 3' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Evento 4' })).not.toBeInTheDocument()
  })
  it('presenta la cartelera y enlaza a todos los eventos', async () => {
    mostrarInicio()

    expect(screen.getByRole('heading', { level: 1, name: 'Descubre los mejores eventos' }))
      .toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver cartelera' })).toHaveAttribute('href', '/eventos')
    expect(screen.getByRole('link', { name: 'Ver todos los eventos' })).toHaveAttribute('href', '/eventos')
    expect(await screen.findByRole('heading', {
      level: 2,
      name: 'Próximos eventos',
    })).toBeInTheDocument()
    expect(await screen.findByRole('heading', {
      level: 2,
      name: 'Caribbean Music Fest 2026',
    })).toBeInTheDocument()
  })

  it('muestra el estado de carga mientras espera la cartelera', () => {
    mostrarInicio()

    expect(within(screen.getByRole('region', { name: 'Próximos eventos' })).getByRole('status'))
      .toHaveTextContent('Cargando eventos')
  })

  it('muestra artistas destacados y permite abrir su perfil o el listado', async () => {
    mostrarInicio()

    expect(await screen.findByRole('link', { name: 'Ver perfil de Solar Beat' })).toHaveAttribute('href', '/artistas/1')
    expect(screen.getByRole('link', { name: 'Ver todos los artistas' })).toHaveAttribute('href', '/artistas')
  })
})
