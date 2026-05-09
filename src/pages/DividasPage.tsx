import { useDividas } from '../hooks/useDividas'
import { Header } from '../components/layout/Header'
import { DividasList } from '../components/dividas/DividasList'

export function DividasPage() {
  const { dividas, totalComprometido, adicionarDivida, removerDivida } = useDividas()

  return (
    <div className="flex flex-col flex-1">
      <Header titulo="Dívidas" />
      <DividasList
        dividas={dividas}
        totalComprometido={totalComprometido}
        onAdicionar={adicionarDivida}
        onRemover={removerDivida}
      />
    </div>
  )
}
