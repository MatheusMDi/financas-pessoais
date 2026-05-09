import { useRendaMensal } from '../hooks/useRendaMensal'
import { useDividas } from '../hooks/useDividas'
import { useCartoes } from '../hooks/useCartoes'
import { useImpostos } from '../hooks/useImpostos'
import { Header } from '../components/layout/Header'
import { SimuladorCompra } from '../components/simulador/SimuladorCompra'

export function SimuladorPage() {
  const { rendaAtual } = useRendaMensal()
  const { totalComprometido } = useDividas()
  const { totalFaturas } = useCartoes()
  const { totalAPagar } = useImpostos()

  const rendaTotal = rendaAtual?.totalLiquido ?? 0
  const totalSaidas = totalComprometido + totalFaturas + totalAPagar
  const margemReal = rendaTotal - totalSaidas

  return (
    <div className="flex flex-col flex-1">
      <Header titulo="Simulador" />
      <SimuladorCompra margemAtual={margemReal} />
    </div>
  )
}
