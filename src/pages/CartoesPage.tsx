import { useCartoes } from '../hooks/useCartoes'
import { Header } from '../components/layout/Header'
import { CartoesList } from '../components/cartoes/CartoesList'

export function CartoesPage() {
  const { cartoes, totalFaturas, totalDisponivel, adicionarCartao, removerCartao } = useCartoes()

  return (
    <div className="flex flex-col flex-1">
      <Header titulo="Cartões" />
      <CartoesList
        cartoes={cartoes}
        totalFaturas={totalFaturas}
        totalDisponivel={totalDisponivel}
        onAdicionar={adicionarCartao}
        onRemover={removerCartao}
      />
    </div>
  )
}
