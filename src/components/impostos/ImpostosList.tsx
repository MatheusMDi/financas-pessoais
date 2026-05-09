import { useState } from 'react'
import { Plus, Trash2, AlertTriangle } from 'lucide-react'
import type { Imposto } from '../../db/types'
import { formatBRL } from '../../utils/formatCurrency'
import { formatDateBR, daysUntil } from '../../utils/formatDate'
import { StatusBadge } from '../ui/StatusBadge'
import { ImpostoForm } from './ImpostoForm'

interface ImpostosListProps {
  impostos: Imposto[]
  totalAPagar: number
  totalProvisionado: number
  onAdicionar: (imposto: Omit<Imposto, 'id'>) => Promise<void>
  onRemover: (id: number) => Promise<void>
  onAtualizar: (id: number, changes: Partial<Imposto>) => Promise<void>
}

const STATUS_COR: Record<string, 'green' | 'yellow' | 'red' | 'blue'> = {
  a_pagar: 'blue',
  provisionado: 'yellow',
  pago: 'green',
  atrasado: 'red',
}

const STATUS_LABEL: Record<string, string> = {
  a_pagar: 'A pagar',
  provisionado: 'Provisionado',
  pago: 'Pago',
  atrasado: 'Atrasado',
}

const GRUPOS: { status: Imposto['status']; label: string }[] = [
  { status: 'atrasado', label: 'Atrasados' },
  { status: 'a_pagar', label: 'A pagar' },
  { status: 'provisionado', label: 'Provisionados' },
  { status: 'pago', label: 'Pagos' },
]

export function ImpostosList({ impostos, totalAPagar, totalProvisionado, onAdicionar, onRemover, onAtualizar }: ImpostosListProps) {
  const [mostraForm, setMostraForm] = useState(false)

  return (
    <div className="flex-1 px-4 pb-24">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-3">
          <p className="text-xs text-[var(--text3)] mb-1">A pagar</p>
          <p className="font-mono text-sm font-semibold text-[var(--red)]">{formatBRL(totalAPagar)}</p>
        </div>
        <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-3">
          <p className="text-xs text-[var(--text3)] mb-1">Provisionado</p>
          <p className="font-mono text-sm font-semibold text-[var(--yellow)]">{formatBRL(totalProvisionado)}</p>
        </div>
      </div>

      {GRUPOS.map(grupo => {
        const itens = impostos.filter(i => i.status === grupo.status)
        if (itens.length === 0) return null
        return (
          <div key={grupo.status} className="mb-4">
            <p className="text-xs font-medium text-[var(--text3)] uppercase tracking-widest mb-2">{grupo.label}</p>
            <div className="flex flex-col gap-2">
              {itens.map(imp => {
                const diasAteVenc = daysUntil(imp.vencimento)
                const urgente = diasAteVenc >= 0 && diasAteVenc <= 7 && imp.status !== 'pago'
                return (
                  <div key={imp.id} className={`bg-[var(--bg3)] border rounded-xl p-3.5 ${urgente ? 'border-[var(--yellow)]' : 'border-[var(--border)]'}`}>
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {urgente && <AlertTriangle size={13} className="text-[var(--yellow)] shrink-0" />}
                          <p className="text-sm font-medium text-[var(--text)] truncate">{imp.descricao}</p>
                        </div>
                        <p className="text-xs text-[var(--text3)] mt-0.5">{imp.competencia} · vence {formatDateBR(imp.vencimento)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <StatusBadge label={STATUS_LABEL[imp.status] ?? imp.status} cor={STATUS_COR[imp.status] ?? 'blue'} />
                        <button onClick={() => imp.id !== undefined && void onRemover(imp.id)} className="p-1.5 text-[var(--text3)] hover:text-[var(--red)]">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-sm font-semibold text-[var(--text)]">{formatBRL(imp.valor)}</p>
                      {imp.status !== 'pago' && (
                        <button
                          onClick={() => imp.id !== undefined && void onAtualizar(imp.id, { status: 'pago' })}
                          className="text-xs px-2.5 py-1 rounded-lg bg-[rgba(0,229,160,0.12)] text-[var(--green)]"
                        >
                          Marcar pago
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {impostos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--text3)]">
          <p className="text-sm">Nenhum imposto cadastrado</p>
        </div>
      )}

      <button
        onClick={() => setMostraForm(true)}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-[var(--green)] text-[#0a0a0f] flex items-center justify-center shadow-lg"
        aria-label="Adicionar imposto"
      >
        <Plus size={24} />
      </button>

      {mostraForm && <ImpostoForm onSalvar={onAdicionar} onFechar={() => setMostraForm(false)} />}
    </div>
  )
}
