import { http, HttpResponse } from 'msw'
import type { DetalleEvento, ResumenEvento } from '../../api/eventos.tipos'

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
