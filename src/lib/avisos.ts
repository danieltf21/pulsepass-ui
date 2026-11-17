export interface Aviso {
  id: number
  tipo: 'exito' | 'error' | 'info'
  mensaje: string
}

let avisos: readonly Aviso[] = []
let siguienteId = 0
const suscriptores = new Set<() => void>()

function actualizar(siguientes: readonly Aviso[]) {
  avisos = siguientes
  suscriptores.forEach((suscriptor) => suscriptor())
}

export function mostrarAviso(tipo: Aviso['tipo'], mensaje: string) {
  // Un reintento con el mismo resultado no acumula mensajes idénticos.
  actualizar([...avisos.filter((aviso) => aviso.tipo !== tipo || aviso.mensaje !== mensaje),
    { id: ++siguienteId, tipo, mensaje }].slice(-3))
}

export function cerrarAviso(id: number) {
  actualizar(avisos.filter((aviso) => aviso.id !== id))
}

export function limpiarAvisos() {
  actualizar([])
}

export function obtenerAvisos() {
  return avisos
}

export function suscribirAvisos(suscriptor: () => void) {
  suscriptores.add(suscriptor)
  return () => { suscriptores.delete(suscriptor) }
}
