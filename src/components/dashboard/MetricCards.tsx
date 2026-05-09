import { ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react'
import { formatBRL } from '../../utils/formatCurrency'
import { diasUteisRestantesNoMes } from '../../utils/formatDate'

interface MetricCardsProps {
  rendaTotal: number
  totalSaidas: number
  margemReal: number
}

export function MetricCards({ rendaTotal, totalSaidas, margemReal }: MetricCardsProps) {
  const diasUteis = diasUteisRestantesNoMes()
  const porDia = diasUteis > 0 ? margemReal / diasUteis : 0

  const cards = [
    {
      label: 'Renda',
      valor: rendaTotal,
      cor: 'var(--green)',
      icon: ArrowUpRight,
      bg: 'rgba(0,229,160,0.08)',
    },
    {
      label: 'Saídas',
      valor: totalSaidas,
      cor: 'var(--red)',
      icon: ArrowDownLeft,
      bg: 'rgba(255,77,106,0.08)',
    },
    {
      label: 'Margem/dia',
      valor: porDia,
      cor: 'var(--blue)',
      icon: Clock,
      bg: 'rgba(77,159,255,0.08)',
    },
  ]

  return (
    <div className="px-4 mt-3 grid grid-cols-3 gap-2">
      {cards.map(card => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className="rounded-xl p-3 border border-[var(--border)] flex flex-col gap-2"
            style={{ background: card.bg }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-semibold text-[var(--text3)] uppercase tracking-wider">{card.label}</p>
              <Icon size={12} style={{ color: card.cor }} />
            </div>
            <p className="font-mono text-xs font-bold leading-none" style={{ color: card.cor }}>
              {formatBRL(card.valor)}
            </p>
          </div>
        )
      })}
    </div>
  )
}
