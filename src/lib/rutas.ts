export const RUTAS = {
  inicio: '/',
  eventos: '/eventos',
  detalleEvento: '/eventos/:eventCode',
  evento: (eventCode: string) => `/eventos/${encodeURIComponent(eventCode)}`,
  artistas: '/artistas',
  detalleArtista: '/artistas/:id',
  artista: (id: number) => `/artistas/${id}`,
  sedes: '/sedes',
  detalleSede: '/sedes/:code',
  sede: (code: string) => `/sedes/${encodeURIComponent(code)}`,
  noEncontrada: '*',
} as const
