import { useMetas } from '../hooks/useMetas'
import { Header } from '../components/layout/Header'
import { MetasList } from '../components/metas/MetasList'

export function MetasPage() {
  const { metas, adicionarMeta, removerMeta, registrarAporte } = useMetas()

  return (
    <div className="flex flex-col flex-1">
      <Header titulo="Metas" />
      <MetasList
        metas={metas}
        onAdicionar={adicionarMeta}
        onRemover={removerMeta}
        onAporte={registrarAporte}
      />
    </div>
  )
}
