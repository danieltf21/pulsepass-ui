import { Link, useNavigate } from 'react-router'
import FormularioEvento from '../components/eventos/FormularioEvento'
import { RUTAS } from '../lib/rutas'

export default function AdminCrearEvento() {
  const navegar = useNavigate()

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        to={RUTAS.adminEventos}
        className="rounded text-marca-700 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
      >
        Volver a eventos
      </Link>
      <h1 className="mt-6 font-titulo text-3xl font-bold">Nuevo evento</h1>
      <FormularioEvento
        onCancelar={() => { void navegar(RUTAS.adminEventos) }}
        onCreado={(evento) => {
          void navegar(RUTAS.administrarEvento(evento.eventCode), {
            replace: true,
            state: { eventoCreado: evento.eventCode },
          })
        }}
      />
    </main>
  )
}
