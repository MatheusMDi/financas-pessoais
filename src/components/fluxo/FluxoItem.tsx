import type { EventoFluxo } from '../../utils/calcFluxo'
import { formatBRL } from '../../utils/formatCurrency'
import { formatDateShort } from '../../utils/formatDate'

interface FluxoItemProps {
  evento: EventoFluxo
  isLast: boolean
}

const DOT_COLORS: Record<EventoFluxo['tipo'], string> = {
  hoje: 'bg-[var(--blue)]',
  entrada: 'bg-[var(--green)]',
  saida: 'bg-[var(--red)]',
  meta: 'bg-[var(--yellow)]',
}

export function FluxoItem({ evento, isLast }: FluxoItemProps) {
  const dotColor = DOT_COLORS[evento.tipo]
  const valorCor = evento.tipo === 'entrada' ? 'text-[var(--green)]' : evento.tipo === 'meta' ? 'text-[var(--yellow)]' : 'text-[var(--red)]'
  const saldoCor = evento.saldoApos >= 0 ? 'text-[var(--text2)]' : 'text-[var(--red)]'

  return (
    <div className="flex gap-3 px-4">
      <div className="flex flex-col items-center">
        <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${dotColor}`} />
        {!isLast && <div className="w-px flex-1 bg-[var(--border)] mt-1" />}
      </div>
      <div className="flex-1 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--text3)] mb-0.5">{formatDateShort(evento.data)}</p>
            <p className="text-sm text-[var(--text)] leading-tight truncate">{evento.descricao}</p>
          </div>
          <div className="text-right shrink-0">
            {evento.tipo !== 'hoje' && (
              <p className={`font-mono text-sm font-medium ${valorCor}`}>
                {evento.valor >= 0 ? '+' : ''}{formatBRL(evento.valor)}
              </p>
            )}
            <p className={`font-mono text-xs ${saldoCor}`}>{formatBRL(evento.saldoApos)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
