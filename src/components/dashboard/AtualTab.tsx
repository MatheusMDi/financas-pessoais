import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
import { useFluxo } from '../../hooks/useFluxo'
import { useRendaMensal } from '../../hooks/useRendaMensal'
import { useDividas } from '../../hooks/useDividas'
import { useCartoes } from '../../hooks/useCartoes'
import { useImpostos } from '../../hooks/useImpostos'
import { useSaldoDia } from '../../hooks/useSaldoDia'
import { SaldoHero } from './SaldoHero'
import { MetricCards } from './MetricCards'
import { GraficoMargem } from './GraficoMargem'
import { GraficoSemanal } from './GraficoSemanal'
import { ReservaEmergenciaCard } from './ReservaEmergenciaCard'
import { FluxoItem } from '../fluxo/FluxoItem'
import { formatBRL } from '../../utils/formatCurrency'

export function AtualTab() {
  const { eventos } = useFluxo(3)
  const { rendaMensal, rendaAtual } = useRendaMensal()
  const { totalComprometido } = useDividas()
  const { totalFaturas } = useCartoes()
  const { totalAPagar } = useImpostos()
  const saldoDia = useSaldoDia()

  // Gastos variáveis do mês corrente
  const hoje = new Date()
  const iniciomês = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10)
  const fimmês = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().slice(0, 10)

  const gastosMes = useLiveQuery(
    () => db.gastosVariaveis.where('data').between(iniciomês, fimmês, true, true).toArray(),
    [iniciomês, fimmês],
    []
  )

  const totalVariaveis = gastosMes.reduce((s, g) => s + g.valor, 0)

  const rendaTotal = rendaAtual?.totalLiquido ?? 0
  const totalSaidas = totalComprometido + totalFaturas + totalAPagar
  const margemReal = rendaAtual?.margemReal ?? rendaTotal - totalSaidas
  const percentualComprometido = rendaTotal > 0 ? (totalSaidas / rendaTotal) * 100 : 0

  const proximosEventos = eventos.filter(e => e.tipo !== 'hoje').slice(0, 3)

  // Breakdown de comprometimento
  const breakdown = [
    { label: 'Dívidas fixas', valor: totalComprometido, cor: 'var(--red)', icon: '📦' },
    { label: 'Cartões', valor: totalFaturas, cor: 'var(--yellow)', icon: '💳' },
    { label: 'Impostos', valor: totalAPagar, cor: 'var(--purple)', icon: '🧾' },
    { label: 'Variáveis (mês)', valor: totalVariaveis, cor: 'var(--blue)', icon: '🛒' },
  ].filter(b => b.valor > 0)

  return (
    <div className="flex flex-col gap-0">
      <SaldoHero
        saldoDia={saldoDia}
        totalComprometido={totalSaidas}
        percentualComprometido={percentualComprometido}
      />

      <ReservaEmergenciaCard />

      <MetricCards
        rendaTotal={rendaTotal}
        totalSaidas={totalSaidas}
        margemReal={margemReal}
      />

      {/* Breakdown de comprometimento */}
      {breakdown.length > 0 && (
        <div className="mx-4 mt-3">
          <p className="text-[10px] font-semibold text-[var(--text3)] uppercase tracking-widest mb-2">Breakdown de saídas</p>
          <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl overflow-hidden">
            {breakdown.map((item, i) => {
              const pct = totalSaidas > 0 ? (item.valor / totalSaidas) * 100 : 0
              return (
                <div key={item.label} className={`px-4 py-3 ${i < breakdown.length - 1 ? 'border-b border-[var(--border)]' : ''}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.icon}</span>
                      <p className="text-xs text-[var(--text2)]">{item.label}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs font-semibold" style={{ color: item.cor }}>
                        {formatBRL(item.valor)}
                      </p>
                      <p className="text-[9px] text-[var(--text3)]">{pct.toFixed(0)}%</p>
                    </div>
                  </div>
                  <div className="h-1 w-full bg-[var(--bg)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: item.cor }}
                    />
                  </div>
                </div>
              )
            })}
            <div className="px-4 py-2.5 bg-[var(--bg)] flex items-center justify-between">
              <p className="text-[10px] text-[var(--text3)] font-semibold uppercase tracking-wide">Total comprometido</p>
              <p className="font-mono text-xs font-bold text-[var(--red)]">{formatBRL(totalSaidas)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <GraficoMargem dados={rendaMensal} />
      </div>

      <div className="mt-4">
        <GraficoSemanal />
      </div>

      {proximosEventos.length > 0 && (
        <div className="mt-4 px-4">
          <p className="text-[10px] font-semibold text-[var(--text3)] uppercase tracking-widest mb-2">Próximos eventos</p>
          <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl overflow-hidden">
            {proximosEventos.map((evento, i) => (
              <FluxoItem
                key={`${evento.data}-${evento.descricao}`}
                evento={evento}
                isLast={i === proximosEventos.length - 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
