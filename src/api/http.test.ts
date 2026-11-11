import { http as mswHttp, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { ApiError, http } from './http'
import { server } from '../test/mocks/server'

describe('cliente HTTP', () => {
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
