import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import userEvent from '@testing-library/user-event'
import { server } from '../test/mocks/server'
import { artistaDePrueba } from '../test/mocks/handlers'
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
  it('busca un artista por su nombre exacto y restaura el listado al limpiar', async () => {
    let nombreConsultado: string | null = null
    server.use(http.get('*/api/artists/by-stage-name', ({ request }) => {
      nombreConsultado = new URL(request.url).searchParams.get('stageName')
      return HttpResponse.json(artistaDePrueba)
    }))
    const usuario = userEvent.setup()
    mostrarLista()
    await screen.findByRole('heading', { name: 'Solar Beat' })

    await usuario.type(screen.getByRole('searchbox', { name: 'Nombre artístico exacto' }), 'Solar Beat')
    await usuario.click(screen.getByRole('button', { name: 'Buscar artista' }))

    await waitFor(() => expect(nombreConsultado).toBe('Solar Beat'))

    expect(await screen.findByText('Búsqueda:')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Solar Beat' })).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }))

    expect(screen.getByRole('searchbox')).toHaveValue('')
    expect(screen.queryByText('Búsqueda:')).not.toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Solar Beat' })).toBeInTheDocument()
  })

  it('informa cuando no existe el nombre buscado', async () => {
    const usuario = userEvent.setup()
    mostrarLista()
    await usuario.type(screen.getByRole('searchbox'), 'Artista inexistente')
    await usuario.click(screen.getByRole('button', { name: 'Buscar artista' }))

    expect(await screen.findByText('No se encontró un artista con ese nombre artístico.')).toBeInTheDocument()
  })

  it('valida el nombre vacío sin consultar el endpoint de búsqueda', async () => {
    let consultas = 0
    server.use(http.get('*/api/artists/by-stage-name', () => {
      consultas += 1
      return HttpResponse.json(null)
    }))
    const usuario = userEvent.setup()
    mostrarLista()
    await usuario.click(screen.getByRole('button', { name: 'Buscar artista' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Escribe el nombre artístico.')
    expect(consultas).toBe(0)
  })
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
