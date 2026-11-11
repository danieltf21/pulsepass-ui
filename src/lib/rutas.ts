export const RUTAS = {
  inicio: '/',
  eventos: '/eventos',
  detalleEvento: '/eventos/:eventCode',
  evento: (eventCode: string) => `/eventos/${encodeURIComponent(eventCode)}`,
  artistas: '/artistas',
  detalleArtista: '/artistas/:id',
  artista: (id: number) => `/artistas/${id}`,
  noEncontrada: '*',
} as const
