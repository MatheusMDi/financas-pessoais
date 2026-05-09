import { useFluxo } from '../hooks/useFluxo'
import { useRendaMensal } from '../hooks/useRendaMensal'
import { useDividas } from '../hooks/useDividas'
import { useCartoes } from '../hooks/useCartoes'
import { useImpostos } from '../hooks/useImpostos'
import { useSaldoDia } from '../hooks/useSaldoDia'
import { Header } from '../components/layout/Header'
import { SaldoHero } from '../components/dashboard/SaldoHero'
import { MetricCards } from '../components/dashboard/MetricCards'
import { GraficoMargem } from '../components/dashboard/GraficoMargem'
import { GraficoSemanal } from '../components/dashboard/GraficoSemanal'
import { ReservaEmergenciaCard } from '../components/dashboard/ReservaEmergenciaCard'
import { FluxoItem } from '../components/fluxo/FluxoItem'

export function Dashboard() {
  const { eventos } = useFluxo(3)
  const { rendaMensal, rendaAtual } = useRendaMensal()
  const { totalComprometido } = useDividas()
  const { totalFaturas } = useCartoes()
  const { totalAPagar } = useImpostos()
  const saldoDia = useSaldoDia()

  const totalSaidas = totalComprometido + totalFaturas + totalAPagar
  const rendaTotal = rendaAtual?.totalLiquido ?? 0
  const margemReal = rendaAtual?.margemReal ?? rendaTotal - totalSaidas
  const percentualComprometido = rendaTotal > 0 ? (totalSaidas / rendaTotal) * 100 : 0

  const proximosEventos = eventos.filter(e => e.tipo !== 'hoje').slice(0, 3)

  return (
    <div className="flex flex-col flex-1 pb-20">
      <Header titulo="MD Finanças" />
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

      <div className="mt-4">
        <GraficoMargem dados={rendaMensal} />
      </div>

      <div className="mt-4">
        <GraficoSemanal />
      </div>

      {proximosEventos.length > 0 && (
        <div className="mt-4 px-4">
          <p className="text-xs font-medium text-[var(--text3)] uppercase tracking-widest mb-3">Próximos eventos</p>
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
