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
    { label: 'Renda', valor: rendaTotal, cor: 'var(--green)' },
    { label: 'Saídas', valor: totalSaidas, cor: 'var(--red)' },
    { label: 'Por dia útil', valor: porDia, cor: 'var(--blue)' },
  ]

  return (
    <div className="px-4 grid grid-cols-3 gap-2">
      {cards.map(card => (
        <div
          key={card.label}
          className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-3"
        >
          <p className="text-[10px] font-medium text-[var(--text3)] uppercase tracking-wider mb-1.5">
            {card.label}
          </p>
          <p className="font-mono text-sm font-semibold" style={{ color: card.cor }}>
            {formatBRL(card.valor)}
          </p>
        </div>
      ))}
    </div>
  )
}
