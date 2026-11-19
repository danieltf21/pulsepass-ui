import EstadoCarga from '../components/ui/EstadoCarga'
import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { z } from 'zod'
import { ApiError } from '../api/http'
import { useEvento } from '../hooks/useEventos'
import { RUTAS } from '../lib/rutas'
import { useAuth } from '../hooks/useAuth'
import ModalCompra from '../components/tickets/ModalCompra'
import DatosEvento from '../components/eventos/DatosEvento'

const parametrosSchema = z.object({ eventCode: z.string().trim().min(1).max(50) })

export default function DetalleEvento() {
  const { sesion } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [compraAbierta, setCompraAbierta] = useState(false)
  const parametros = parametrosSchema.safeParse(useParams())
  const codigo = parametros.success ? parametros.data.eventCode : ''
  const { data: evento, isPending, isError, error, isFetching, refetch } = useEvento(codigo)
  const noDisponible = !parametros.success
    || (isError && error instanceof ApiError && (error.status === 403 || error.status === 404))
  const sinRolComprador = sesion.estado === 'autenticada' && !sesion.usuario.roles.includes('USER')
  const compraHabilitada = evento?.status === 'PUBLISHED' && sesion.estado !== 'cargando' && !sinRolComprador

  return (
    <main className={compraHabilitada
      ? 'px-4 pt-10 pb-[calc(7rem+env(safe-area-inset-bottom))] md:px-6 md:pb-10'
      : 'px-4 py-10 sm:px-6'}>
      <div className="mx-auto max-w-4xl">
        <Link to={RUTAS.eventos} className="rounded text-marca-700 dark:text-indigo-300 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600">
          Volver al catálogo
        </Link>

        {noDisponible ? (
          <section className="mt-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
            <h1 className="font-titulo text-2xl font-bold">Evento no disponible</h1>
            <p className="mt-3 text-slate-600 dark:text-slate-400">El evento no existe o no está disponible para consultar.</p>
          </section>
        ) : isPending ? (
          <EstadoCarga className="mt-8">Cargando evento…</EstadoCarga>
        ) : isError ? (
          <section role="alert" className="mt-8 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6">
            <h1 className="font-titulo text-2xl font-bold">No se pudo cargar el evento</h1>
            <p className="mt-3 text-red-800 dark:text-red-200">
              {error instanceof ApiError ? error.message : 'La información recibida no tiene el formato esperado.'}
            </p>
            <button
              type="button"
              disabled={isFetching}
              onClick={() => void refetch()}
              className="mt-4 rounded-lg bg-marca-600 px-4 py-2 text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:cursor-wait disabled:opacity-60"
            >
              {isFetching ? 'Reintentando…' : 'Reintentar'}
            </button>
          </section>
        ) : (
          <article className="mt-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm sm:p-8">
            <DatosEvento evento={evento} />

            <div className={compraHabilitada
              ? 'fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg dark:border-slate-700 dark:bg-slate-900 md:static md:mt-8 md:border-0 md:bg-transparent md:p-0 md:shadow-none md:dark:bg-transparent'
              : 'mt-8'}>
              <button
                type="button"
                disabled={!compraHabilitada}
                onClick={() => {
                  if (sesion.estado === 'anonima') {
                    void navigate(RUTAS.login, {
                      state: { desde: location.pathname + location.search + location.hash },
                    })
                  } else if (sesion.estado === 'autenticada' && sesion.usuario.roles.includes('USER')) {
                    setCompraAbierta(true)
                  }
                }}
                className="min-h-11 w-full rounded-lg bg-marca-600 px-5 py-3 font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
              >
                Comprar entrada
              </button>
              {evento.status !== 'PUBLISHED' && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Este evento no tiene entradas disponibles para comprar.</p>
              )}
              {sinRolComprador && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">La compra de entradas requiere una cuenta con rol de usuario.</p>
              )}
            </div>
            {compraAbierta && sesion.estado === 'autenticada' && sesion.usuario.roles.includes('USER') && (
              <ModalCompra
                abierto
                eventCode={evento.eventCode}
                nombreEvento={evento.name}
                onCerrar={() => setCompraAbierta(false)}
                onComprado={(ticket) => {
                  setCompraAbierta(false)
                  void navigate(RUTAS.compraConfirmada(ticket.ticketCode))
                }}
              />
            )}

            <section aria-labelledby="titulo-artistas" className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
              <h2 id="titulo-artistas" className="font-titulo text-xl font-bold">Artistas</h2>
              {evento.artists.length === 0 ? (
                <p className="mt-3 text-slate-600 dark:text-slate-400">Aún no hay artistas anunciados.</p>
              ) : (
                <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                  {evento.artists.map((artista) => (
                    <li key={artista.id} className="rounded-lg bg-slate-50 dark:bg-slate-950 p-4">
                      <h3 className="font-semibold">
                        <Link
                          to={RUTAS.artista(artista.id)}
                          className="rounded text-marca-700 dark:text-indigo-300 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
                        >
                          {artista.stageName}
                        </Link>
                      </h3>
                      {artista.genre && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{artista.genre}</p>}
                      {artista.country && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{artista.country}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </article>
        )}
      </div>
    </main>
  )
}
