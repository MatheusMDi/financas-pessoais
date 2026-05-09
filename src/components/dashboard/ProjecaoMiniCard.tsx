import { Link } from 'react-router-dom'
import { TrendingUp, AlertTriangle, ChevronRight } from 'lucide-react'
import { useProjection } from '../../hooks/useProjection'
import { formatBRL, formatBRLCompact } from '../../utils/formatCurrency'

export function ProjecaoMiniCard() {
  const projecao = useProjection()

  if (!projecao) return null

  const { snapshot30, snapshot60, snapshot90, kpis } = projecao
  const temAlerta = kpis.mesesNegativos.length > 0 || kpis.menorSaldo < 0

  return (
    <div className="mx-4 bg-[var(--bg3)] border border-[var(--border)] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-[var(--blue)]" />
          <p className="text-xs font-semibold text-[var(--text)] uppercase tracking-widest">Projeção</p>
        </div>
        <Link
          to="/projecao"
          className="flex items-center gap-0.5 text-[10px] text-[var(--blue)]"
        >
          Ver detalhes <ChevronRight size={11} />
        </Link>
      </div>

      {/* Alerta de mês crítico */}
      {temAlerta && (
        <div className="flex items-center gap-2 px-3.5 py-2 bg-[rgba(255,77,106,0.06)] border-b border-[var(--border)]">
          <AlertTriangle size={12} className="text-[var(--red)] shrink-0" />
          <p className="text-[10px] text-[var(--red)] leading-relaxed">
            {kpis.mesesNegativos.length > 0
              ? `Saldo negativo previsto em ${kpis.mesesNegativos.length} mês${kpis.mesesNegativos.length > 1 ? 'es' : ''}`
              : `Menor saldo: ${formatBRL(kpis.menorSaldo)}`}
          </p>
        </div>
      )}

      {/* Snapshots 30/60/90 */}
      <div className="grid grid-cols-3 divide-x divide-[var(--border)]">
        {[
          { label: '30 dias', valor: snapshot30 },
          { label: '60 dias', valor: snapshot60 },
          { label: '90 dias', valor: snapshot90 },
        ].map(({ label, valor }) => (
          <div key={label} className="flex flex-col items-center py-2.5 gap-0.5">
            <p className="text-[9px] text-[var(--text3)] uppercase tracking-wide">{label}</p>
            <p
              className="font-mono text-sm font-bold"
              style={{ color: valor >= 0 ? 'var(--green)' : 'var(--red)' }}
            >
              {formatBRLCompact(valor)}
            </p>
          </div>
        ))}
      </div>

      {/* Próximo salário */}
      {kpis.proximoSalarioData && kpis.proximoSalarioValor > 0 && (
        <div className="border-t border-[var(--border)] px-3.5 py-2 flex items-center justify-between">
          <p className="text-[10px] text-[var(--text3)]">
            💰 Próximo salário:{' '}
            {new Date(kpis.proximoSalarioData + 'T00:00:00').toLocaleDateString('pt-BR', {
              day: '2-digit', month: 'short',
            })}
          </p>
          <p className="font-mono text-[10px] font-semibold text-[var(--green)]">
            +{formatBRLCompact(kpis.proximoSalarioValor)}
          </p>
        </div>
      )}
    </div>
  )
}
