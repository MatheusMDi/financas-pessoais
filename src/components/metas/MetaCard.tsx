import { useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import type { Meta } from '../../db/types'
import { formatBRL } from '../../utils/formatCurrency'
import { formatDateBR } from '../../utils/formatDate'
import { ProgressBar } from '../ui/ProgressBar'
import { StatusBadge } from '../ui/StatusBadge'
import { FormInput } from '../ui/FormInput'

interface MetaCardProps {
  meta: Meta
  onRemover: () => void
  onAporte: (valor: number) => Promise<void>
}

const TIPO_ICONE: Record<string, string> = {
  reserva_emergencia: '🛡️',
  compra_planejada: '🛒',
  quitar_divida: '💸',
  investimento: '📈',
  outro: '🎯',
}

const STATUS_COR: Record<string, 'green' | 'yellow' | 'blue' | 'red'> = {
  em_andamento: 'blue',
  concluida: 'green',
  pausada: 'yellow',
  cancelada: 'red',
}

const STATUS_LABEL: Record<string, string> = {
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
  pausada: 'Pausada',
  cancelada: 'Cancelada',
}

export function MetaCard({ meta, onRemover, onAporte }: MetaCardProps) {
  const [mostraAporte, setMostraAporte] = useState(false)
  const [valorAporte, setValorAporte] = useState('')
  const [salvando, setSalvando] = useState(false)

  const pct = meta.valorAlvo > 0 ? (meta.valorAcumulado / meta.valorAlvo) * 100 : 0
  const corBarra = pct >= 100 ? 'green' : pct >= 60 ? 'blue' : 'purple'

  async function handleAporte() {
    const v = parseFloat(valorAporte)
    if (isNaN(v) || v <= 0) return
    setSalvando(true)
    try {
      await onAporte(v)
      setValorAporte('')
      setMostraAporte(false)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-3.5">
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl shrink-0">{TIPO_ICONE[meta.tipo] ?? '🎯'}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--text)] truncate">{meta.nome}</p>
            <p className="text-xs text-[var(--text3)] mt-0.5">Prazo: {formatDateBR(meta.prazo)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <StatusBadge label={STATUS_LABEL[meta.status] ?? meta.status} cor={STATUS_COR[meta.status] ?? 'blue'} />
          <button onClick={onRemover} className="p-1.5 text-[var(--text3)] hover:text-[var(--red)] transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      <ProgressBar valor={meta.valorAcumulado} total={meta.valorAlvo} cor={corBarra} />
      <div className="flex items-center justify-between mt-2">
        <p className="font-mono text-xs text-[var(--text2)]">
          {formatBRL(meta.valorAcumulado)} / {formatBRL(meta.valorAlvo)}
        </p>
        <p className="font-mono text-sm font-semibold text-[var(--blue)]">{pct.toFixed(0)}%</p>
      </div>

      {meta.status === 'em_andamento' && (
        <div className="mt-3">
          {mostraAporte ? (
            <div className="flex gap-2">
              <FormInput
                label=""
                type="number"
                inputMode="decimal"
                value={valorAporte}
                onChange={e => setValorAporte(e.target.value)}
                placeholder="Valor do aporte"
              />
              <button
                onClick={() => void handleAporte()}
                disabled={salvando}
                className="px-3 py-2 rounded-xl bg-[var(--green)] text-[#0a0a0f] text-sm font-semibold shrink-0 self-end mb-px disabled:opacity-60"
              >
                OK
              </button>
              <button
                onClick={() => setMostraAporte(false)}
                className="px-3 py-2 rounded-xl bg-[var(--bg)] text-[var(--text3)] text-sm shrink-0 self-end mb-px border border-[var(--border)]"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setMostraAporte(true)}
              className="flex items-center gap-1.5 text-xs text-[var(--blue)] py-1"
            >
              <Plus size={13} />
              Registrar aporte
            </button>
          )}
        </div>
      )}
    </div>
  )
}
