import Boton from './Boton'

interface BotonReintentarProps {
  enCurso: boolean
  onReintentar: () => void
  textoEnCurso?: string
}

export default function BotonReintentar({
  enCurso,
  onReintentar,
  textoEnCurso = 'Reintentando…',
}: BotonReintentarProps) {
  return (
    <Boton
      disabled={enCurso}
      onClick={onReintentar}
      className="mt-4"
    >
      {enCurso ? textoEnCurso : 'Reintentar'}
    </Boton>
  )
}
