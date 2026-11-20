import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { http, HttpResponse } from 'msw'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { AuthContext } from '../context/AuthContext'
import { RUTAS } from '../lib/rutas'
import { server } from '../test/mocks/server'
import { artistaDePrueba, eventoDePrueba, sedeDePrueba } from '../test/mocks/handlers'
import AdminGestionEvento from './AdminGestionEvento'
import AdminEventos from './AdminEventos'
import AdminCrearEvento from './AdminCrearEvento'
import type { DetalleEvento } from '../api/eventos.tipos'

const borrador = { ...eventoDePrueba, status: 'DRAFT' as const }

function mostrarGestion(recorrido = false) {
  const cliente = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } })
  if (!recorrido) cliente.setQueryData(['eventos', 'creados', 3], [borrador])
  render(
    <QueryClientProvider client={cliente}>
      <AuthContext.Provider value={{
        sesion: {
          estado: 'autenticada', accessToken: 'token-prueba', expiraEn: 1_800_000_060_000,
          usuario: { id: 3, username: 'admin', email: 'admin@example.com', roles: ['ADMIN'] },
        },
        iniciarSesion: async () => {}, cerrarSesion: () => {},
      }}>
        <MemoryRouter initialEntries={[recorrido ? RUTAS.adminEventos : RUTAS.administrarEvento(borrador.eventCode)]}>
          <Routes>
            <Route path={RUTAS.adminEventos} element={<AdminEventos />} />
            <Route path={RUTAS.adminCrearEvento} element={<AdminCrearEvento />} />
            <Route path={RUTAS.adminGestionEvento} element={<AdminGestionEvento />} />
            <Route path={RUTAS.sinPermisos} element={<h1>Sin permisos</h1>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
  return cliente
}

describe('Publicación de eventos', () => {
  it('completa crear, asociar y publicar, y conserva el evento al volver a administración', async () => {
    let evento: DetalleEvento = { ...borrador, artists: [], eventDate: '2030-12-12T18:00:00' }
    const operaciones: string[] = []
    server.use(
      http.post('*/api/events', () => { operaciones.push('crear'); return HttpResponse.json(evento, { status: 201 }) }),
      http.get('*/api/events/CMF-2026', () => HttpResponse.json(evento)),
      http.post('*/api/events/CMF-2026/artists/1', () => {
        operaciones.push('asociar')
        evento = { ...evento, artists: [artistaDePrueba] }
        return HttpResponse.json(evento)
      }),
      http.patch('*/api/events/CMF-2026/publish', () => {
        operaciones.push('publicar')
        evento = { ...evento, status: 'PUBLISHED' }
        return HttpResponse.json(evento)
      }),
    )
    mostrarGestion(true)
    fireEvent.click(screen.getByRole('link', { name: 'Nuevo evento' }))
    await screen.findByRole('option', { name: `${sedeDePrueba.name} (${sedeDePrueba.code})` })
    fireEvent.change(screen.getByLabelText('Código del evento'), { target: { value: evento.eventCode } })
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: evento.name } })
    fireEvent.change(screen.getByLabelText('Fecha y hora'), { target: { value: '2030-12-12T18:00' } })
    fireEvent.change(screen.getByLabelText('Sede'), { target: { value: sedeDePrueba.code } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear evento' }))
    expect(await screen.findByText('Evento creado correctamente.')).toBeInTheDocument()
    await screen.findByRole('option', { name: artistaDePrueba.stageName })
    fireEvent.change(screen.getByLabelText('Agregar artista'), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Asociar' }))
    expect(await screen.findByText('Artista asociado correctamente.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Publicar evento' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar publicación' }))
    expect(await screen.findByText('Evento publicado correctamente.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'Volver a eventos' }))
    expect(await screen.findByRole('heading', { name: 'Administración de eventos' })).toBeInTheDocument()
    expect(screen.getByText('Publicado')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: `Gestionar evento ${evento.eventCode}` })).toHaveAttribute('href', RUTAS.administrarEvento(evento.eventCode))
    expect(operaciones).toEqual(['crear', 'asociar', 'publicar'])
  })

  it('asocia el artista elegido y actualiza el evento y la lista de sesión', async () => {
    const nuevoArtista = { ...artistaDePrueba, id: 2, stageName: 'Neon Waves' }
    let evento = { ...borrador }
    let asociaciones = 0
    server.use(
      http.get('*/api/events/CMF-2026', () => HttpResponse.json(evento)),
      http.get('*/api/artists/active', () => HttpResponse.json([artistaDePrueba, nuevoArtista])),
      http.post('*/api/events/CMF-2026/artists/2', () => {
        asociaciones += 1
        evento = { ...evento, artists: [...evento.artists, nuevoArtista] }
        return HttpResponse.json(evento)
      }),
    )
    const cliente = mostrarGestion()
    await screen.findByRole('option', { name: 'Neon Waves' })
    fireEvent.change(screen.getByLabelText('Agregar artista'), { target: { value: '2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Asociar' }))
    expect(await screen.findByText('Artista asociado correctamente.')).toBeInTheDocument()
    const seccion = screen.getByRole('region', { name: 'Artistas asociados' })
    expect(within(seccion).getByRole('list')).toHaveTextContent('Neon Waves')
    expect(screen.getByRole('option', { name: 'Neon Waves' })).toBeDisabled()
    expect(cliente.getQueryData(['eventos', 'creados', 3])).toEqual([evento])
    expect(asociaciones).toBe(1)
  })

  it('bloquea artistas existentes y valida la selección vacía sin enviar', async () => {
    const nuevoArtista = { ...artistaDePrueba, id: 2, stageName: 'Neon Waves' }
    let asociaciones = 0
    server.use(
      http.get('*/api/events/CMF-2026', () => HttpResponse.json(borrador)),
      http.get('*/api/artists/active', () => HttpResponse.json([artistaDePrueba, nuevoArtista])),
      http.post('*/api/events/CMF-2026/artists/:id', () => {
        asociaciones += 1
        return HttpResponse.json(borrador)
      }),
    )
    mostrarGestion()
    expect(await screen.findByRole('option', { name: 'Solar Beat' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Asociar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Selecciona un artista.')
    expect(asociaciones).toBe(0)
  })

  it('conserva la selección y muestra el conflicto de asociación', async () => {
    const nuevoArtista = { ...artistaDePrueba, id: 2, stageName: 'Neon Waves' }
    server.use(
      http.get('*/api/events/CMF-2026', () => HttpResponse.json(borrador)),
      http.get('*/api/artists/active', () => HttpResponse.json([nuevoArtista])),
      http.post('*/api/events/CMF-2026/artists/2', () => HttpResponse.json({
        timestamp: '2026-11-16T10:00:00', status: 409, error: 'Conflict',
        message: 'El artista ya está asociado.', details: {},
      }, { status: 409 })),
    )
    mostrarGestion()
    await screen.findByRole('option', { name: 'Neon Waves' })
    fireEvent.change(screen.getByLabelText('Agregar artista'), { target: { value: '2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Asociar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('El artista ya está asociado.')
    expect(screen.getByLabelText('Agregar artista')).toHaveValue('2')
    expect(screen.queryByText('Artista asociado correctamente.')).not.toBeInTheDocument()
  })

  const prototipo = HTMLDialogElement.prototype
  const metodos = ['showModal', 'close'] as const
  const originales = metodos.map((nombre) => Object.getOwnPropertyDescriptor(prototipo, nombre))
  beforeAll(() => {
    // Solo simula apertura/cierre: no verifica el foco nativo del navegador.
    Object.defineProperty(prototipo, 'showModal', { configurable: true, value: function (this: HTMLDialogElement) { this.open = true } })
    Object.defineProperty(prototipo, 'close', { configurable: true, value: function (this: HTMLDialogElement) { this.open = false } })
  })
  afterAll(() => {
    metodos.forEach((nombre, indice) => {
      const original = originales[indice]
      if (original) Object.defineProperty(prototipo, nombre, original)
      else Reflect.deleteProperty(prototipo, nombre)
    })
  })

  it('exige confirmación y actualiza el detalle y la lista de sesión al publicar', async () => {
    let evento = { ...borrador, status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' }
    let publicaciones = 0
    server.use(
      http.get('*/api/events/CMF-2026', () => HttpResponse.json(evento)),
      http.patch('*/api/events/CMF-2026/publish', () => {
        publicaciones += 1
        evento = { ...evento, status: 'PUBLISHED' }
        return HttpResponse.json(evento)
      }),
    )
    const cliente = mostrarGestion()
    fireEvent.click(await screen.findByRole('button', { name: 'Publicar evento' }))
    expect(publicaciones).toBe(0)
    const dialogo = screen.getByRole('dialog', { name: 'Publicar evento' })
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Confirmar publicación' }))
    expect(await screen.findByText('Evento publicado correctamente.')).toBeInTheDocument()
    expect(screen.getByText('Publicado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Publicar evento' })).toBeDisabled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(cliente.getQueryData(['eventos', 'creados', 3])).toEqual([evento])
    expect(publicaciones).toBe(1)
  })

  it('permite cerrar la confirmación sin publicar', async () => {
    let publicaciones = 0
    server.use(
      http.get('*/api/events/CMF-2026', () => HttpResponse.json(borrador)),
      http.patch('*/api/events/CMF-2026/publish', () => {
        publicaciones += 1
        return HttpResponse.json(eventoDePrueba)
      }),
    )
    mostrarGestion()
    fireEvent.click(await screen.findByRole('button', { name: 'Publicar evento' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('Borrador')).toBeInTheDocument()
    expect(publicaciones).toBe(0)
  })

  it('conserva el modal y muestra el mensaje del backend ante un 409', async () => {
    server.use(
      http.get('*/api/events/CMF-2026', () => HttpResponse.json(borrador)),
      http.patch('*/api/events/CMF-2026/publish', () => HttpResponse.json({
        timestamp: '2026-11-16T10:00:00', status: 409, error: 'Conflict',
        message: 'No se puede publicar el evento.', details: {},
      }, { status: 409 })),
    )
    mostrarGestion()
    fireEvent.click(await screen.findByRole('button', { name: 'Publicar evento' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar publicación' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No se puede publicar el evento.')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Borrador')).toBeInTheDocument()
    expect(screen.queryByText('Evento publicado correctamente.')).not.toBeInTheDocument()
  })

  it.each(['PUBLISHED', 'SOLD_OUT', 'CANCELLED', 'FINISHED'] as const)('deshabilita publicar en estado %s', async (status) => {
    server.use(http.get('*/api/events/CMF-2026', () => HttpResponse.json({ ...borrador, status })))
    mostrarGestion()
    expect(await screen.findByRole('button', { name: 'Publicar evento' })).toBeDisabled()
  })
})
