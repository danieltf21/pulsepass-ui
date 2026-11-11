import { http, HttpResponse } from 'msw'
import type { DetalleEvento, ResumenEvento } from '../../api/eventos.tipos'
import type { Artista } from '../../api/artistas.tipos'

export const artistaDePrueba: Artista = {
  id: 1,
  stageName: 'Solar Beat',
  country: 'Colombia',
  genre: 'Electrónica',
  active: true,
}

function respuestaNoEncontrada() {
  return HttpResponse.json({
    timestamp: '2026-11-11T10:00:00',
    status: 404,
    error: 'Not Found',
    message: 'Resource not found',
    details: {},
  }, { status: 404 })
}

export const eventoDePrueba: DetalleEvento = {
  id: 1,
  eventCode: 'CMF-2026',
  name: 'Caribbean Music Fest 2026',
  description: 'Un encuentro de música en Santa Marta.',
  category: 'MUSIC',
  status: 'PUBLISHED',
  eventDate: '2026-12-12T18:00:00',
  minimumAge: 18,
  venueCode: 'VEN-SMR-01',
  venueName: 'Marina Convention Center',
  artists: [
    {
      id: 1,
      stageName: 'Solar Beat',
      country: 'Colombia',
      genre: 'Electrónica',
      active: true,
    },
  ],
}

export const eventosPublicadosDePrueba: ResumenEvento[] = [
  {
    eventCode: eventoDePrueba.eventCode,
    name: eventoDePrueba.name,
    status: eventoDePrueba.status,
    eventDate: eventoDePrueba.eventDate,
    venueName: eventoDePrueba.venueName,
  },
]

// Estos handlers se usarán solo en el entorno de pruebas.
export const handlers = [
  http.get('*/api/artists/active', () => HttpResponse.json([artistaDePrueba])),
  http.get('*/api/artists/by-stage-name', ({ request }) => {
    const nombre = new URL(request.url).searchParams.get('stageName')
    return nombre === artistaDePrueba.stageName
      ? HttpResponse.json(artistaDePrueba)
      : respuestaNoEncontrada()
  }),
  http.get('*/api/artists/:id', ({ params }) =>
    params.id === String(artistaDePrueba.id)
      ? HttpResponse.json(artistaDePrueba)
      : respuestaNoEncontrada(),
  ),
  http.get('*/api/events/by-artist', ({ request }) => {
    const nombre = new URL(request.url).searchParams.get('stageName')
    return HttpResponse.json(nombre === artistaDePrueba.stageName ? eventosPublicadosDePrueba : [])
  }),
  http.get('*/api/events/published', () =>
    HttpResponse.json(eventosPublicadosDePrueba),
  ),
  http.get('*/api/events/:eventCode', ({ params }) => {
    if (params.eventCode === eventoDePrueba.eventCode) {
      return HttpResponse.json(eventoDePrueba)
    }

    return HttpResponse.json(
      {
        timestamp: '2026-11-11T10:00:00',
        status: 404,
        error: 'Not Found',
        message: 'Event not found',
        details: {},
      },
      { status: 404 },
    )
  }),
]
