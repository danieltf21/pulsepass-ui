import { formatearPrecioCOP } from '../../lib/formato'

interface PrecioCOPProps {
  valor: number
  className?: string
}

export default function PrecioCOP({ valor, className }: PrecioCOPProps) {
  return <span className={className}>{formatearPrecioCOP(valor)}</span>
}
