import { Plus } from 'lucide-react'
import { useState } from 'react'
import type { Divida } from '../../db/types'
import { formatBRL } from '../../utils/formatCurrency'
import { DividaCard } from './DividaCard'
import { DividaForm } from './DividaForm'

interface DividasListProps {
  dividas: Divida[]
  totalComprometido: number
  onAdicionar: (divida: Omit<Divida, 'id'>) => Promise<void>
  onRemover: (id: number) => Promise<void>
  onAtualizar: (id: number, changes: Partial<Divida>) => Promise<void>
}

export function DividasList({ dividas, totalComprometido, onAdicionar, onRemover, onAtualizar }: DividasListProps) {
  const [mostraForm, setMostraForm] = useState(false)

  const ativas = dividas.filter(d => d.status !== 'quitado')
  const quitadas = dividas.filter(d => d.status === 'quitado')

  async function handleMarcarPago(divida: Divida, novoValorParcela?: number) {
    if (divida.id === undefined) return
    const novasPagas = divida.parcelasPagas + 1
    const vp = novoValorParcela ?? divida.valorParcela
    const quitado = novasPagas >= divida.parcelasTotais
    await onAtualizar(divida.id, {
      parcelasPagas: novasPagas,
      valorParcela: vp,
      status: quitado ? 'quitado' : divida.status,
    })
  }

  return (
    <div className="flex-1 px-4 pb-24">
      {ativas.length === 0 && quitadas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--text3)]">
          <p className="text-sm">Nenhuma dívida cadastrada</p>
          <p className="text-xs mt-1">Toque em + para adicionar</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {ativas.map(d => (
            <DividaCard
              key={d.id}
              divida={d}
              onRemover={() => d.id !== undefined && void onRemover(d.id)}
              onMarcarPago={(novoValor) => handleMarcarPago(d, novoValor)}
            />
          ))}
          {quitadas.length > 0 && (
            <>
              <p className="text-xs text-[var(--text3)] mt-2 uppercase tracking-widest">Quitadas</p>
              {quitadas.map(d => (
                <DividaCard
                  key={d.id}
                  divida={d}
                  onRemover={() => d.id !== undefined && void onRemover(d.id)}
                />
              ))}
            </>
          )}
        </div>
      )}

      {dividas.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <div className="flex justify-between items-center">
            <p className="text-sm text-[var(--text2)]">Total comprometido/mês</p>
            <p className="font-mono text-sm font-semibold text-[var(--red)]">{formatBRL(totalComprometido)}</p>
          </div>
        </div>
      )}

      <button
        onClick={() => setMostraForm(true)}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-[var(--green)] text-[#0a0a0f] flex items-center justify-center shadow-lg"
        aria-label="Adicionar dívida"
      >
        <Plus size={24} />
      </button>

      {mostraForm && (
        <DividaForm
          onSalvar={onAdicionar}
          onFechar={() => setMostraForm(false)}
        />
      )}
    </div>
  )
}
