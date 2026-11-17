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
  it('combina categoría, texto y artista en cliente conservando los otros parámetros', async () => {
    let consultas = 0
    server.use(http.get('*/api/events/by-artist', () => {
      consultas += 1
      return HttpResponse.json([
        { ...eventoDePrueba, name: 'Festival musical' },
        { ...eventoDePrueba, eventCode: 'SPORT-1', name: 'Festival deportivo', category: 'SPORTS' },
        { ...eventoDePrueba, eventCode: 'SPORT-2', name: 'Torneo local', category: 'SPORTS' },
      ])
    }))
    const usuario = userEvent.setup()
    const { router } = mostrarCatalogo('/eventos?artista=Solar%20Beat&q=festival&origen=inicio')
    await screen.findByRole('heading', { name: 'Festival musical' })
    await usuario.selectOptions(screen.getByRole('combobox', { name: 'Categoría' }), 'SPORTS')

    expect(screen.getByRole('heading', { name: 'Festival deportivo' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Festival musical' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Torneo local' })).not.toBeInTheDocument()
    expect(screen.getByText('1 resultado')).toBeInTheDocument()
    const parametros = new URLSearchParams(router.state.location.search)
    expect(parametros.get('categoria')).toBe('SPORTS')
    expect(parametros.get('artista')).toBe('Solar Beat')
    expect(parametros.get('q')).toBe('festival')
    expect(parametros.get('origen')).toBe('inicio')

    await usuario.selectOptions(screen.getByRole('combobox', { name: 'Categoría' }), '')
    expect(new URLSearchParams(router.state.location.search).has('categoria')).toBe(false)
    expect(screen.getByRole('searchbox')).toHaveValue('festival')
    expect(screen.getByText('2 resultados')).toBeInTheDocument()
    expect(consultas).toBe(1)
  })

  it('restaura categoría y texto desde la URL al volver a montar el catálogo', async () => {
    const usuario = userEvent.setup()
    const primera = mostrarCatalogo('/eventos?q=Caribbean')
    await screen.findByRole('heading', { level: 2, name: eventoDePrueba.name })
    await usuario.selectOptions(screen.getByRole('combobox', { name: 'Categoría' }), 'MUSIC')
    const url = '/eventos' + primera.router.state.location.search
    primera.unmount()
    mostrarCatalogo(url)

    expect(screen.getByRole('combobox', { name: 'Categoría' })).toHaveValue('MUSIC')
    expect(screen.getByRole('searchbox')).toHaveValue('Caribbean')
    expect(await screen.findByRole('heading', { level: 2, name: eventoDePrueba.name })).toBeInTheDocument()
  })

  it('muestra cero coincidencias y permite recuperar eventos al limpiar categoría', async () => {
    const usuario = userEvent.setup()
    mostrarCatalogo('/eventos?categoria=SPORTS')
    expect(await screen.findByText('No hay eventos que coincidan con tu búsqueda.')).toBeInTheDocument()
    await usuario.selectOptions(screen.getByRole('combobox', { name: 'Categoría' }), '')
    expect(await screen.findByRole('heading', { level: 2, name: eventoDePrueba.name })).toBeInTheDocument()
  })

  it('ignora una categoría desconocida de la URL sin romper la cartelera', async () => {
    mostrarCatalogo('/eventos?categoria=INVALIDA')
    expect(screen.getByRole('combobox', { name: 'Categoría' })).toHaveValue('')
    expect(await screen.findByRole('heading', { level: 2, name: eventoDePrueba.name })).toBeInTheDocument()
  })

  it.each([undefined, 'INVALIDA'])('rechaza una categoría de respuesta fuera del contrato: %s', async (category) => {
    server.use(http.get('*/api/events/published', () => HttpResponse.json([{ ...eventoDePrueba, category }])))
    mostrarCatalogo()
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar los eventos publicados.')
    expect(screen.queryByRole('heading', { level: 2, name: eventoDePrueba.name })).not.toBeInTheDocument()
  })

  it('consulta por artista y restaura el catálogo al quitar el filtro', async () => {
    let artistaConsultado: string | null = null
    let consultasGenerales = 0
    server.use(
      http.get('*/api/events/by-artist', ({ request }) => {
        artistaConsultado = new URL(request.url).searchParams.get('stageName')
        return HttpResponse.json([{
          eventCode: 'SOLAR-2026',
          name: 'Concierto de Solar Beat',
          category: 'MUSIC',
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
