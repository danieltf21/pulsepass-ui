export const RUTAS = {
  inicio: '/',
  eventos: '/eventos',
  detalleEvento: '/eventos/:eventCode',
  evento: (eventCode: string) => `/eventos/${encodeURIComponent(eventCode)}`,
  noEncontrada: '*',
} as const
