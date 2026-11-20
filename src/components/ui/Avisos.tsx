import { useEffect, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { cerrarAviso, obtenerAvisos, suscribirAvisos, type Aviso } from '../../lib/avisos'

const tonos: Record<Aviso['tipo'], string> = {
  exito: 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-200',
  error: 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950 text-red-950 dark:text-red-200',
  info: 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950 text-indigo-950 dark:text-indigo-200',
}
const titulos: Record<Aviso['tipo'], string> = { exito: 'Operación completada', error: 'No se completó la operación', info: 'Información' }

export default function Avisos() {
  const avisos = useSyncExternalStore(suscribirAvisos, obtenerAvisos)
  const [destino, setDestino] = useState<Element>(document.body)

  useEffect(() => {
    // Un dialog modal deja inerte el resto del documento: el aviso debe vivir en él.
    function actualizarDestino() {
      const dialogos = document.querySelectorAll('dialog[open]')
      setDestino(dialogos.item(dialogos.length - 1) ?? document.body)
    }
    actualizarDestino()
    const observador = new MutationObserver(actualizarDestino)
    observador.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['open'] })
    return () => observador.disconnect()
  }, [])

  return createPortal(
    <section aria-label="Notificaciones" className="pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto flex max-h-[45dvh] max-w-md flex-col gap-3 overflow-y-auto">
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {avisos.map((aviso) => `${titulos[aviso.tipo]}: ${aviso.mensaje}`).join('. ')}
      </div>
      {avisos.map((aviso) => (
        <div key={aviso.id} className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg ${tonos[aviso.tipo]}`}>
          <div className="min-w-0 flex-1 break-words">
            <p className="font-semibold">{titulos[aviso.tipo]}</p>
            <p className="mt-1 text-sm">{aviso.mensaje}</p>
          </div>
          <button type="button" onClick={() => cerrarAviso(aviso.id)} aria-label={`Cerrar aviso: ${aviso.mensaje}`} className="min-h-11 shrink-0 rounded-lg px-3 py-2 text-sm underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current">
            Cerrar
          </button>
        </div>
      ))}
    </section>, destino,
  )
}
