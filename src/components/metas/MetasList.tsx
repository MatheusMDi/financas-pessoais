import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Meta } from '../../db/types'
import { MetaCard } from './MetaCard'
import { MetaForm } from './MetaForm'

interface MetasListProps {
  metas: Meta[]
  onAdicionar: (meta: Omit<Meta, 'id'>) => Promise<void>
  onRemover: (id: number) => Promise<void>
  onAporte: (id: number, valor: number) => Promise<void>
}

export function MetasList({ metas, onAdicionar, onRemover, onAporte }: MetasListProps) {
  const [mostraForm, setMostraForm] = useState(false)

  const ativas = metas.filter(m => m.status === 'em_andamento')
  const outras = metas.filter(m => m.status !== 'em_andamento')

  return (
    <div className="flex-1 px-4 pb-24">
      {metas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--text3)]">
          <p className="text-sm">Nenhuma meta cadastrada</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {ativas.map(m => (
            <MetaCard
              key={m.id}
              meta={m}
              onRemover={() => m.id !== undefined && void onRemover(m.id)}
              onAporte={v => m.id !== undefined ? onAporte(m.id, v) : Promise.resolve()}
            />
          ))}
          {outras.length > 0 && (
            <>
              <p className="text-xs text-[var(--text3)] mt-2 uppercase tracking-widest">Outras</p>
              {outras.map(m => (
                <MetaCard
                  key={m.id}
                  meta={m}
                  onRemover={() => m.id !== undefined && void onRemover(m.id)}
                  onAporte={v => m.id !== undefined ? onAporte(m.id, v) : Promise.resolve()}
                />
              ))}
            </>
          )}
        </div>
      )}

      <button
        onClick={() => setMostraForm(true)}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-[var(--green)] text-[#0a0a0f] flex items-center justify-center shadow-lg"
        aria-label="Adicionar meta"
      >
        <Plus size={24} />
      </button>

      {mostraForm && <MetaForm onSalvar={onAdicionar} onFechar={() => setMostraForm(false)} />}
    </div>
  )
}
