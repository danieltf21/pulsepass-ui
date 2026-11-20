const formatoFecha = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'long',
  timeStyle: 'short',
})

const formatoMoneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
})

export function formatearFecha(valor: string): string {
  return formatoFecha.format(new Date(valor))
}

export function formatearPrecioCOP(valor: number): string {
  return formatoMoneda.format(valor)
}
