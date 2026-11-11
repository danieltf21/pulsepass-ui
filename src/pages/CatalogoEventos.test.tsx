import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { eventosPublicadosDePrueba } from '../test/mocks/handlers'
import { server } from '../test/mocks/server'
import CatalogoEventos from './CatalogoEventos'

function mostrarCatalogo(entrada = '/eventos') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[entrada]}>
        <CatalogoEventos />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CatalogoEventos', () => {
  it('muestra los eventos publicados que devuelve la API', async () => {
    mostrarCatalogo()

    expect(await screen.findByRole('heading', {
      level: 1,
      name: 'Cartelera de eventos',
    })).toBeInTheDocument()
    expect(await screen.findByRole('heading', {
      level: 2,
      name: eventosPublicadosDePrueba[0].name,
    })).toBeInTheDocument()
  })

  it('filtra por nombre sin distinguir mayúsculas ni tildes', async () => {
    mostrarCatalogo()
    const buscador = await screen.findByRole('searchbox', { name: 'Buscar por nombre del evento' })

    fireEvent.change(buscador, { target: { value: 'caribbean MUSIC' } })

    expect(await screen.findByRole('heading', {
      level: 2,
      name: 'Caribbean Music Fest 2026',
    })).toBeInTheDocument()
    expect(screen.getByText('1 resultado')).toBeInTheDocument()
  })

  it('muestra un mensaje cuando la búsqueda no coincide con eventos', async () => {
    mostrarCatalogo()
    const buscador = await screen.findByRole('searchbox', { name: 'Buscar por nombre del evento' })

    fireEvent.change(buscador, { target: { value: 'evento inexistente' } })

    expect(await screen.findByText('No hay eventos que coincidan con tu búsqueda.'))
      .toBeInTheDocument()
    await waitFor(() => expect(within(screen.getByRole('search')).getByRole('searchbox'))
      .toHaveValue('evento inexistente'))
    expect(screen.queryByRole('heading', { level: 2, name: 'Caribbean Music Fest 2026' }))
      .not.toBeInTheDocument()
  })

  it('muestra estado vacío cuando no hay eventos publicados', async () => {
    server.use(http.get('*/api/events/published', () => HttpResponse.json([])))
    mostrarCatalogo()

    expect(await screen.findByText(/Aún no hay eventos publicados/)).toBeInTheDocument()
  })

  it('muestra un error y permite reintentar si falla la API', async () => {
    server.use(http.get('*/api/events/published', () => HttpResponse.json({ error: 'fallo' }, { status: 500 })))
    mostrarCatalogo()

    expect(await screen.findByRole('alert', {}, { timeout: 4000 }))
      .toHaveTextContent('No se pudieron cargar los eventos publicados.')
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })

  it('inicializa el campo desde q en la URL', () => {
    mostrarCatalogo('/eventos?q=Caribbean')

    expect(screen.getByRole('searchbox', { name: 'Buscar por nombre del evento' }))
      .toHaveValue('Caribbean')
  })
})
