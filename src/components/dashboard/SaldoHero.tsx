import { formatBRL } from '../../utils/formatCurrency'

interface SaldoHeroProps {
  saldoAtual: number
  totalComprometido: number
  percentualComprometido: number
}

export function SaldoHero({ saldoAtual, totalComprometido, percentualComprometido }: SaldoHeroProps) {
  const corBadge =
    percentualComprometido < 60
      ? 'bg-[rgba(0,229,160,0.12)] text-[var(--green)]'
      : percentualComprometido < 80
        ? 'bg-[rgba(255,209,102,0.12)] text-[var(--yellow)]'
        : 'bg-[rgba(255,77,106,0.12)] text-[var(--red)]'

  return (
    <div className="px-4 pt-2 pb-4">
      <p className="text-xs font-medium text-[var(--text3)] uppercase tracking-widest mb-1">Saldo disponível</p>
      <p className="font-mono text-4xl font-bold text-[var(--text)] leading-none">
        {formatBRL(saldoAtual)}
      </p>
      <p className="text-sm text-[var(--text2)] mt-1.5">
        após <span className="text-[var(--red)]">{formatBRL(totalComprometido)}</span> em compromissos
      </p>
      <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${corBadge}`}>
        {percentualComprometido.toFixed(0)}% comprometido
      </span>
    </div>
  )
}
