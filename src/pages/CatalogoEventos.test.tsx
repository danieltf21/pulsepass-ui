import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { eventoDePrueba } from '../test/mocks/handlers'
import { server } from '../test/mocks/server'
import CatalogoEventos from './CatalogoEventos'

function mostrarCatalogo(entrada = '/eventos') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  const router = createMemoryRouter([
    { path: '/eventos', element: <CatalogoEventos /> },
  ], { initialEntries: [entrada] })

  const vista = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { ...vista, router }
}

describe('CatalogoEventos', () => {
  it('consulta por artista y restaura el catálogo al quitar el filtro', async () => {
    let artistaConsultado: string | null = null
    let consultasGenerales = 0
    server.use(
      http.get('*/api/events/by-artist', ({ request }) => {
        artistaConsultado = new URL(request.url).searchParams.get('stageName')
        return HttpResponse.json([{
          eventCode: 'SOLAR-2026',
          name: 'Concierto de Solar Beat',
          status: 'PUBLISHED',
          eventDate: '2026-12-12T18:00:00',
          venueName: 'Marina Convention Center',
        }])
      }),
      http.get('*/api/events/published', () => {
        consultasGenerales += 1
        return HttpResponse.json([eventoDePrueba])
      }),
    )
    const usuario = userEvent.setup()
    const { router } = mostrarCatalogo('/eventos?artista=Solar%20Beat')

    expect(await screen.findByRole('heading', { name: 'Concierto de Solar Beat' })).toBeInTheDocument()
    expect(artistaConsultado).toBe('Solar Beat')
    expect(consultasGenerales).toBe(0)

    await usuario.click(screen.getByRole('button', { name: 'Quitar filtro de artista' }))

    expect(await screen.findByRole('heading', { name: eventoDePrueba.name })).toBeInTheDocument()
    expect(new URLSearchParams(router.state.location.search).has('artista')).toBe(false)
    expect(consultasGenerales).toBe(1)
  })

  it('muestra el estado vacío cuando el artista no tiene eventos', async () => {
    server.use(http.get('*/api/events/by-artist', () => HttpResponse.json([])))
    mostrarCatalogo('/eventos?artista=Solar%20Beat')

    expect(await screen.findByText('No hay eventos disponibles para este artista.')).toBeInTheDocument()
  })
  it('actualiza q en la URL al buscar y lo elimina al limpiar', async () => {
    const usuario = userEvent.setup()
    const { router } = mostrarCatalogo('/eventos?origen=inicio')
    await screen.findByRole('heading', { level: 2, name: 'Caribbean Music Fest 2026' })

    await usuario.type(screen.getByRole('searchbox'), 'Caribbean')
    await waitFor(() => {
      const parametros = new URLSearchParams(router.state.location.search)
      expect(parametros.get('q')).toBe('Caribbean')
      expect(parametros.get('origen')).toBe('inicio')
    })

    await usuario.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }))
    await waitFor(() => expect(new URLSearchParams(router.state.location.search).has('q')).toBe(false))
    expect(screen.getByRole('searchbox')).toHaveValue('')
    expect(screen.getByRole('heading', { level: 2, name: 'Caribbean Music Fest 2026' })).toBeInTheDocument()
  })
  it('muestra los eventos publicados que devuelve la API', async () => {
    mostrarCatalogo()

    expect(await screen.findByRole('heading', {
      level: 1,
      name: 'Cartelera de eventos',
    })).toBeInTheDocument()
    expect(await screen.findByRole('heading', {
      level: 2,
      name: eventoDePrueba.name,
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
