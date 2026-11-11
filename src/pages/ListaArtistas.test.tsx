import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { server } from '../test/mocks/server'
import ListaArtistas from './ListaArtistas'

function mostrarLista() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retryDelay: 0 } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter><ListaArtistas /></MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ListaArtistas', () => {
  it('muestra artistas activos y el enlace a su perfil', async () => {
    mostrarLista()

    expect(await screen.findByRole('heading', { level: 2, name: 'Solar Beat' })).toBeInTheDocument()
    expect(screen.getByText('Electrónica')).toBeInTheDocument()
    expect(screen.getByText('Colombia')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver perfil de Solar Beat' })).toHaveAttribute('href', '/artistas/1')
  })

  it('muestra carga mientras espera la respuesta', () => {
    mostrarLista()

    expect(screen.getByRole('status')).toHaveTextContent('Cargando artistas')
  })

  it('muestra el estado vacío cuando no hay artistas activos', async () => {
    server.use(http.get('*/api/artists/active', () => HttpResponse.json([])))
    mostrarLista()

    expect(await screen.findByText('Aún no hay artistas activos.')).toBeInTheDocument()
  })

  it('muestra un error y permite recuperar el listado al reintentar', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const usuario = userEvent.setup()
    server.use(http.get('*/api/artists/active', () => new HttpResponse(null, { status: 500 })))
    mostrarLista()

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar los artistas')
    server.resetHandlers()
    await usuario.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByRole('heading', { name: 'Solar Beat' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
