import { AlertTriangle, TrendingDown } from 'lucide-react'
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
    <div className="mx-4 mt-1 mb-2 rounded-2xl overflow-hidden bg-[var(--bg3)] border border-[var(--border)] animate-fade-in">
      {/* Accent top bar */}
      <div className="h-0.5 w-full" style={{ background: 'var(--blue)' }} />

      <div className="p-4 pb-3">
        {/* Label + alerta */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-semibold text-[var(--text3)] uppercase tracking-widest">Disponível hoje</p>
          {alertaAtivo && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(255,77,106,0.12)]">
              <AlertTriangle size={10} className="text-[var(--red)]" />
              <span className="text-[10px] text-[var(--red)] font-medium">Acima do ritmo</span>
            </div>
          )}
        </div>

        {/* Saldo principal */}
        <p className="font-mono text-[2.75rem] font-bold leading-none tracking-tight" style={{ color: saldoCor }}>
          {formatBRL(saldoDisponivel)}
        </p>

        <p className="text-xs text-[var(--text2)] mt-1.5">
          após <span className="font-semibold" style={{ color: 'var(--red)' }}>{formatBRL(totalComprometido)}</span> em compromissos
        </p>

        {/* Barra de comprometimento */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] text-[var(--text3)]">Comprometimento da renda</p>
            <p className="text-[10px] font-semibold" style={{ color: barColor }}>
              {pct.toFixed(0)}%
            </p>
          </div>
          <div className="h-1.5 w-full bg-[var(--bg)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: barColor }}
            />
          </div>
        </div>
      </div>

      {/* Context chips */}
      <div className="border-t border-[var(--border)] grid grid-cols-3 divide-x divide-[var(--border)]">
        {[
          {
            label: 'Por dia útil',
            valor: formatBRL(saldoPorDia),
            cor: 'var(--blue)',
          },
          {
            label: 'Fim do mês',
            valor: formatBRL(projecaoFimMes),
            cor: projecaoFimMes >= 0 ? 'var(--green)' : 'var(--red)',
          },
          {
            label: 'Dias restantes',
            valor: String(diasUteisRestantes),
            cor: 'var(--text2)',
          },
        ].map(item => (
          <div key={item.label} className="flex flex-col items-center py-2.5 gap-0.5">
            <p className="text-[9px] text-[var(--text3)] uppercase tracking-wide">{item.label}</p>
            <p className="font-mono text-xs font-bold" style={{ color: item.cor }}>{item.valor}</p>
          </div>
        ))}
      </div>

      {/* Segunda linha de chips se tiver dados extras */}
      {(gastoHoje > 0 || mediaGastoDiario > 0) && (
        <div className="border-t border-[var(--border)] flex items-center justify-between px-4 py-2">
          {gastoHoje > 0 && (
            <div className="flex items-center gap-1.5">
              <TrendingDown size={11} className="text-[var(--red)]" />
              <p className="text-[10px] text-[var(--text3)]">
                Gasto hoje: <span className="font-mono font-semibold text-[var(--red)]">{formatBRL(gastoHoje)}</span>
              </p>
            </div>
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
