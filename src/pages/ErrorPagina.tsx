import { Link } from 'react-router'
import { RUTAS } from '../lib/rutas'

export default function ErrorPagina() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 font-cuerpo text-slate-900 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-titulo text-3xl font-bold">No se pudo mostrar la página</h1>
        <p role="alert" className="mt-4 text-slate-600">
          Ocurrió un error inesperado. Puedes intentar recargar la página o volver al inicio.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-marca-600 px-5 py-3 font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
          >
            Recargar página
          </button>
          <Link
            to={RUTAS.inicio}
            reloadDocument
            className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  )
}
