import { useEffect, useId, useRef, type ReactNode } from 'react'

interface ModalProps {
  abierto: boolean
  titulo: string
  onCerrar: () => void
  children: ReactNode
  bloqueado?: boolean
}

export default function Modal({ abierto, titulo, onCerrar, children, bloqueado = false }: ModalProps) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const tituloId = useId()

  useEffect(() => {
    const elemento = dialogo.current
    if (!abierto || !elemento) return
    const focoAnterior = document.activeElement
    if (!elemento.open) elemento.showModal()

    return () => {
      if (elemento.open) elemento.close()
      if (focoAnterior instanceof HTMLElement && focoAnterior.isConnected) focoAnterior.focus()
    }
  }, [abierto])

  return (
    <dialog
      ref={dialogo}
      aria-labelledby={tituloId}
      aria-busy={bloqueado}
      onCancel={(event) => {
        event.preventDefault()
        if (!bloqueado) onCerrar()
      }}
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-slate-900 dark:text-slate-100 shadow-xl backdrop:bg-slate-950/60"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <h2 id={tituloId} className="font-titulo text-2xl font-bold">{titulo}</h2>
        <button
          type="button"
          disabled={bloqueado}
          onClick={onCerrar}
          aria-label="Cerrar diálogo"
          className="rounded-lg px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:cursor-wait disabled:opacity-60"
        >
          Cerrar
        </button>
      </div>
      {children}
    </dialog>
  )
}
