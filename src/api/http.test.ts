import { http as mswHttp, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { ApiError, http } from './http'
import { server } from '../test/mocks/server'
import { obtenerEvento, obtenerEventosPorArtista, obtenerEventosPublicados } from './eventos'
import { obtenerArtista, obtenerArtistaPorNombre, obtenerArtistasActivos } from './artistas'
import { obtenerSede, obtenerSedesActivas } from './sedes'

describe('cliente HTTP', () => {
  it.each([
    ['eventos publicados', '/events/published', () => obtenerEventosPublicados()],
    ['detalle de evento', '/events/CMF-2026', () => obtenerEvento('CMF-2026')],
    ['eventos por artista', '/events/by-artist', () => obtenerEventosPorArtista('Solar Beat')],
    ['artistas activos', '/artists/active', () => obtenerArtistasActivos()],
    ['detalle de artista', '/artists/1', () => obtenerArtista(1)],
    ['artista por nombre', '/artists/by-stage-name', () => obtenerArtistaPorNombre('Solar Beat')],
    ['sedes activas', '/venues/active', () => obtenerSedesActivas()],
    ['detalle de sede', '/venues/VEN-SMR-01', () => obtenerSede('VEN-SMR-01')],
  ] as const)('convierte una respuesta inválida de %s en ApiError', async (_nombre, ruta, consultar) => {
    server.use(mswHttp.get(`*/api${ruta}`, () => HttpResponse.json({
      datoInterno: 'Información que no debe exponerse',
    })))

    const resultado = consultar()

    await expect(resultado).rejects.toBeInstanceOf(ApiError)
    await expect(resultado).rejects.toMatchObject({
      status: 200,
      message: 'La información recibida no tiene el formato esperado.',
      details: {},
    })
  })
  it('convierte un ErrorResponse válido en ApiError con status y details', async () => {
    server.use(mswHttp.get('*/api/test', () => HttpResponse.json({
      timestamp: '2026-11-11T10:00:00',
      status: 400,
      error: 'Bad Request',
      message: 'Revisa los datos.',
      details: { name: 'El nombre es obligatorio.' },
    }, { status: 400 })))

    await expect(http('/test')).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      message: 'Revisa los datos.',
      details: { name: 'El nombre es obligatorio.' },
    })
  })

  it('usa un error genérico cuando el cuerpo no cumple el contrato', async () => {
    server.use(mswHttp.get('*/api/test', () => HttpResponse.json({
      message: 'Detalle interno sensible',
    }, { status: 500 })))

    await expect(http('/test')).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
      message: 'No se pudo completar la solicitud. Inténtalo de nuevo.',
      details: {},
    })
  })

  it('mapea 401 a un mensaje seguro sin exponer la respuesta del servidor', async () => {
    server.use(mswHttp.get('*/api/test', () => HttpResponse.json({
      timestamp: '2026-11-11T10:00:00',
      status: 401,
      error: 'Unauthorized',
      message: 'Información privada del servidor',
      details: {},
    }, { status: 401 })))

    await expect(http('/test')).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
      message: 'Debes iniciar sesión para continuar.',
    })
  })

  it('devuelve ApiError cuando la solicitud de red falla', async () => {
    server.use(mswHttp.get('*/api/test', () => HttpResponse.error()))

    await expect(http('/test')).rejects.toBeInstanceOf(ApiError)
  })
})
