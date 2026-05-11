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

  const pct = Math.min(percentualComprometido, 100)
  const barColor = pct < 60 ? 'var(--green)' : pct < 80 ? 'var(--yellow)' : 'var(--red)'
  const saldoCor = saldoDisponivel >= 0 ? 'var(--green)' : 'var(--red)'

  return (
    <div className="mx-4 mt-1 mb-2 rounded-xl overflow-hidden bg-[var(--bg2)] border border-[var(--border)]">
      {/* Thin accent rule */}
      <div className="h-px w-full bg-[var(--blue)] opacity-80" />

      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between mb-1">
          <p className="text-[10px] font-semibold text-[var(--text3)] uppercase tracking-widest">Disponível hoje</p>
          {alertaAtivo && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(246,70,93,0.1)] border border-[rgba(246,70,93,0.2)]">
              <AlertTriangle size={9} className="text-[var(--red)]" />
              <span className="text-[9px] text-[var(--red)] font-semibold">Acima do ritmo</span>
            </div>
          )}
        </div>

        {/* Balance — large, JetBrains Mono weight 700 */}
        <p
          className="font-mono text-[2.75rem] font-bold leading-none tracking-tight"
          style={{ color: saldoCor, fontWeight: 700, letterSpacing: '-0.02em' }}
        >
          {formatBRL(saldoDisponivel)}
        </p>

        <p className="text-xs text-[var(--text3)] mt-1.5">
          após{' '}
          <span className="font-semibold text-[var(--text2)]">{formatBRL(totalComprometido)}</span>{' '}
          em compromissos
        </p>

        {/* Commitment bar */}
        <div className="mt-3.5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[9px] font-medium text-[var(--text3)] uppercase tracking-wide">Renda comprometida</p>
            <p className="text-[10px] font-bold" style={{ color: barColor }}>{pct.toFixed(0)}%</p>
          </div>
          <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: 'var(--bg3)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, background: barColor, transition: 'width 0.5s ease' }}
            />
          </div>
        </div>
      </div>

      {/* Stat row — Binance table-style grid */}
      <div className="border-t border-[var(--border)] grid grid-cols-3 divide-x divide-[var(--border)]">
        {[
          { label: 'Por dia útil',  valor: formatBRL(saldoPorDia),    cor: 'var(--blue)' },
          { label: 'Fim do mês',    valor: formatBRL(projecaoFimMes),  cor: projecaoFimMes >= 0 ? 'var(--green)' : 'var(--red)' },
          { label: 'Dias úteis',    valor: String(diasUteisRestantes),  cor: 'var(--text2)' },
        ].map(item => (
          <div key={item.label} className="flex flex-col items-center py-2.5 gap-0.5">
            <p className="text-[8px] font-semibold text-[var(--text3)] uppercase tracking-wide">{item.label}</p>
            <p className="font-mono text-xs font-bold" style={{ color: item.cor }}>{item.valor}</p>
          </div>
        ))}
      </div>

      {/* Secondary row: gasto hoje + média */}
      {(gastoHoje > 0 || mediaGastoDiario > 0) && (
        <div className="border-t border-[var(--border)] flex items-center justify-between px-4 py-1.5">
          {gastoHoje > 0 && (
            <p className="text-[10px] text-[var(--text3)]">
              Hoje: <span className="font-mono font-semibold text-[var(--red)]">{formatBRL(gastoHoje)}</span>
            </p>
          )}
          {mediaGastoDiario > 0 && (
            <p className="text-[10px] text-[var(--text3)]">
              Média: <span className="font-mono font-semibold text-[var(--text2)]">{formatBRL(mediaGastoDiario)}/dia</span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
