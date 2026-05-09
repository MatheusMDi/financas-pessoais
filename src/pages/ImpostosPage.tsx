import { useImpostos } from '../hooks/useImpostos'
import { Header } from '../components/layout/Header'
import { ImpostosList } from '../components/impostos/ImpostosList'

export function ImpostosPage() {
  const { impostos, totalAPagar, totalProvisionado, adicionarImposto, removerImposto, atualizarImposto } = useImpostos()

  return (
    <div className="flex flex-col flex-1">
      <Header titulo="Impostos" />
      <ImpostosList
        impostos={impostos}
        totalAPagar={totalAPagar}
        totalProvisionado={totalProvisionado}
        onAdicionar={adicionarImposto}
        onRemover={removerImposto}
        onAtualizar={atualizarImposto}
      />
    </div>
  )
}
