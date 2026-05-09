import { Trash2 } from 'lucide-react'
import type { Cartao } from '../../db/types'
import { formatBRL } from '../../utils/formatCurrency'
import { ProgressBar } from '../ui/ProgressBar'
import { StatusBadge } from '../ui/StatusBadge'

interface CartaoCardProps {
  cartao: Cartao
  onRemover: () => void
}

const BANDEIRA_ICONE: Record<string, string> = {
  visa: '💳',
  mastercard: '🟠',
  elo: '🔵',
  amex: '🟩',
}

const STATUS_LABEL: Record<string, string> = {
  ok: 'OK',
  atencao: 'Atenção',
  critico: 'Crítico',
  bloqueado: 'Bloqueado',
}

const STATUS_COR: Record<string, 'green' | 'yellow' | 'red' | 'blue'> = {
  ok: 'green',
  atencao: 'yellow',
  critico: 'red',
  bloqueado: 'red',
}

export function CartaoCard({ cartao, onRemover }: CartaoCardProps) {
  const pctUso = cartao.limiteTotal > 0 ? (cartao.faturaAtual / cartao.limiteTotal) * 100 : 0
  const corBarra = pctUso < 60 ? 'green' : pctUso < 80 ? 'yellow' : 'red'

  const hoje = new Date()
  const dataVenc = new Date(hoje.getFullYear(), hoje.getMonth(), cartao.diaVencimento)
  if (dataVenc < hoje) dataVenc.setMonth(dataVenc.getMonth() + 1)
  const diasAteVenc = Math.ceil((dataVenc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-3.5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{BANDEIRA_ICONE[cartao.bandeira] ?? '💳'}</span>
          <div>
            <p className="text-sm font-medium text-[var(--text)]">{cartao.nome}</p>
            <p className="text-xs text-[var(--text3)]">{cartao.banco}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge label={STATUS_LABEL[cartao.status] ?? cartao.status} cor={STATUS_COR[cartao.status] ?? 'green'} />
          <button onClick={onRemover} className="p-1.5 text-[var(--text3)] hover:text-[var(--red)] transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      <ProgressBar valor={cartao.faturaAtual} total={cartao.limiteTotal} cor={corBarra} />
      <div className="flex items-center justify-between mt-2">
        <div>
          <p className="font-mono text-sm font-semibold text-[var(--red)]">{formatBRL(cartao.faturaAtual)}</p>
          <p className="text-xs text-[var(--text3)]">de {formatBRL(cartao.limiteTotal)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-[var(--text)]">{diasAteVenc}d</p>
          <p className="text-xs text-[var(--text3)]">para vencer</p>
        </div>
      </div>
    </div>
  )
}
