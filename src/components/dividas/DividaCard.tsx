import { Trash2 } from 'lucide-react'
import type { Divida } from '../../db/types'
import { formatBRL } from '../../utils/formatCurrency'
import { ProgressBar } from '../ui/ProgressBar'
import { StatusBadge } from '../ui/StatusBadge'

interface DividaCardProps {
  divida: Divida
  onRemover: () => void
}

const STATUS_LABEL: Record<string, string> = {
  em_aberto: 'Em aberto',
  atencao: 'Atenção',
  quitado: 'Quitado',
}

const STATUS_COR: Record<string, 'green' | 'red' | 'yellow'> = {
  em_aberto: 'blue' as 'green',
  atencao: 'yellow',
  quitado: 'green',
}

const TIPO_ICONE: Record<string, string> = {
  parcela_fixa: '📦',
  cartao: '💳',
  emprestimo_pf: '🏦',
  emprestimo_pj: '🏢',
  outro: '📋',
}

export function DividaCard({ divida, onRemover }: DividaCardProps) {
  const parcelasRestantes = divida.parcelasTotais - divida.parcelasPagas
  const cor = divida.status === 'atencao' ? 'yellow' : divida.status === 'quitado' ? 'green' : 'blue' as 'blue'

  return (
    <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-3.5">
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl shrink-0">{TIPO_ICONE[divida.tipo] ?? '📋'}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--text)] truncate">{divida.nome}</p>
            <p className="text-xs text-[var(--text3)] mt-0.5">
              {divida.parcelasPagas}/{divida.parcelasTotais} parcelas · vence dia {divida.vencimentoDia}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge label={STATUS_LABEL[divida.status] ?? divida.status} cor={STATUS_COR[divida.status] ?? 'blue'} />
          <button
            onClick={onRemover}
            className="p-1.5 text-[var(--text3)] hover:text-[var(--red)] transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      <ProgressBar valor={divida.parcelasPagas} total={divida.parcelasTotais} cor={cor} />
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-[var(--text3)]">{parcelasRestantes} restantes</p>
        <p className="font-mono text-sm font-semibold text-[var(--text)]">
          {formatBRL(divida.valorParcela)}<span className="text-[var(--text3)] font-normal">/mês</span>
        </p>
      </div>
    </div>
  )
}
