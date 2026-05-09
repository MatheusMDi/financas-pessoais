import { AlertTriangle } from 'lucide-react'
import { formatBRL } from '../../utils/formatCurrency'
import type { SaldoDia } from '../../hooks/useSaldoDia'

interface SaldoHeroProps {
  saldoDia: SaldoDia
  totalComprometido: number
  percentualComprometido: number
}

export function SaldoHero({ saldoDia, totalComprometido, percentualComprometido }: SaldoHeroProps) {
  const { saldoDisponivel, gastoHoje, saldoPorDia, diasUteisRestantes, mediaGastoDiario, projecaoFimMes, alertaAtivo } = saldoDia

  const corBadge =
    percentualComprometido < 60
      ? 'bg-[rgba(0,229,160,0.12)] text-[var(--green)]'
      : percentualComprometido < 80
        ? 'bg-[rgba(255,209,102,0.12)] text-[var(--yellow)]'
        : 'bg-[rgba(255,77,106,0.12)] text-[var(--red)]'

  return (
    <div className="px-4 pt-2 pb-3">
      <p className="text-xs font-medium text-[var(--text3)] uppercase tracking-widest mb-1">Disponível hoje</p>
      <div className="flex items-start justify-between">
        <p className="font-mono text-4xl font-bold text-[var(--green)] leading-none">
          {formatBRL(saldoDisponivel)}
        </p>
        {alertaAtivo && (
          <div className="flex items-center gap-1 px-2 py-1 bg-[rgba(255,77,106,0.12)] rounded-lg">
            <AlertTriangle size={12} className="text-[var(--red)]" />
            <span className="text-xs text-[var(--red)] font-medium">Acima do ritmo</span>
          </div>
        )}
      </div>
      <p className="text-sm text-[var(--text2)] mt-1">
        após <span className="text-[var(--red)]">{formatBRL(totalComprometido)}</span> em compromissos
      </p>

      <div className="mt-2 flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${corBadge}`}>
          {percentualComprometido.toFixed(0)}% comprometido
        </span>
      </div>

      {/* Context line */}
      <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
        {[
          { label: 'Gasto hoje', valor: formatBRL(gastoHoje), cor: gastoHoje > 0 ? 'text-[var(--red)]' : 'text-[var(--text2)]' },
          { label: 'Por dia útil', valor: formatBRL(saldoPorDia), cor: 'text-[var(--blue)]' },
          { label: 'Dias restantes', valor: String(diasUteisRestantes), cor: 'text-[var(--text2)]' },
          { label: 'Média diária', valor: formatBRL(mediaGastoDiario), cor: 'text-[var(--text2)]' },
          { label: 'Projeção fim mês', valor: formatBRL(projecaoFimMes), cor: projecaoFimMes >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]' },
        ].map(item => (
          <div key={item.label} className="shrink-0 bg-[var(--bg3)] border border-[var(--border)] rounded-lg px-2.5 py-1.5">
            <p className="text-[10px] text-[var(--text3)] whitespace-nowrap">{item.label}</p>
            <p className={`font-mono text-xs font-semibold whitespace-nowrap ${item.cor}`}>{item.valor}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
