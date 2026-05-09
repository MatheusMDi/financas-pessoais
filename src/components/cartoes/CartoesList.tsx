import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Cartao } from '../../db/types'
import { formatBRL } from '../../utils/formatCurrency'
import { CartaoCard } from './CartaoCard'
import { CartaoForm } from './CartaoForm'

interface CartoesListProps {
  cartoes: Cartao[]
  totalFaturas: number
  totalDisponivel: number
  onAdicionar: (cartao: Omit<Cartao, 'id'>) => Promise<void>
  onRemover: (id: number) => Promise<void>
}

export function CartoesList({ cartoes, totalFaturas, totalDisponivel, onAdicionar, onRemover }: CartoesListProps) {
  const [mostraForm, setMostraForm] = useState(false)

  return (
    <div className="flex-1 px-4 pb-24">
      {cartoes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--text3)]">
          <p className="text-sm">Nenhum cartão cadastrado</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {cartoes.map(c => (
            <CartaoCard
              key={c.id}
              cartao={c}
              onRemover={() => c.id !== undefined && void onRemover(c.id)}
            />
          ))}
          <div className="mt-2 pt-4 border-t border-[var(--border)] flex flex-col gap-1.5">
            <div className="flex justify-between">
              <p className="text-sm text-[var(--text2)]">Total faturas</p>
              <p className="font-mono text-sm font-semibold text-[var(--red)]">{formatBRL(totalFaturas)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-[var(--text2)]">Limite disponível</p>
              <p className="font-mono text-sm font-semibold text-[var(--green)]">{formatBRL(totalDisponivel)}</p>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setMostraForm(true)}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-[var(--green)] text-[#0a0a0f] flex items-center justify-center shadow-lg"
        aria-label="Adicionar cartão"
      >
        <Plus size={24} />
      </button>
      {mostraForm && <CartaoForm onSalvar={onAdicionar} onFechar={() => setMostraForm(false)} />}
    </div>
  )
}
