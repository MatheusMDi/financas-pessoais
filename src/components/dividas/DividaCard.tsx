import { useState } from 'react'
import { Trash2, CheckCircle, RefreshCw } from 'lucide-react'
import type { Divida } from '../../db/types'
import { formatBRL } from '../../utils/formatCurrency'
import { ProgressBar } from '../ui/ProgressBar'
import { StatusBadge } from '../ui/StatusBadge'

interface DividaCardProps {
  divida: Divida
  onRemover: () => void
  onMarcarPago?: (novoValorParcela?: number) => Promise<void>
}

const STATUS_LABEL: Record<string, string> = {
  em_aberto: 'Em aberto',
  atencao: 'Atenção',
  quitado: 'Quitado',
}

const STATUS_COR: Record<string, 'green' | 'red' | 'yellow' | 'blue'> = {
  em_aberto: 'blue',
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

const RECORRENCIA_LABEL: Record<string, string> = {
  fixa: '🔁 Fixa',
  variavel: '🔄 Variável',
}

export function DividaCard({ divida, onRemover, onMarcarPago }: DividaCardProps) {
  const [confirmando, setConfirmando] = useState(false)
  const [novoValor, setNovoValor] = useState('')
  const [salvando, setSalvando] = useState(false)

  const parcelasRestantes = divida.parcelasTotais - divida.parcelasPagas
  const cor = STATUS_COR[divida.status] ?? 'blue'
  const jaQuitado = divida.status === 'quitado' || parcelasRestantes <= 0

  async function handleMarcarPago() {
    if (!onMarcarPago) return
    setSalvando(true)
    try {
      if (divida.recorrencia === 'variavel' && novoValor) {
        await onMarcarPago(parseFloat(novoValor.replace(',', '.')))
      } else {
        await onMarcarPago()
      }
      setConfirmando(false)
      setNovoValor('')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-3.5">
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl shrink-0">{TIPO_ICONE[divida.tipo] ?? '📋'}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--text)] truncate">{divida.nome}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-xs text-[var(--text3)]">
                {divida.parcelasPagas}/{divida.parcelasTotais} parcelas · vence dia {divida.vencimentoDia}
              </p>
              {divida.recorrencia && divida.recorrencia !== 'nenhuma' && (
                <span className="text-[10px] text-[var(--blue)] bg-[rgba(77,159,255,0.1)] px-1.5 py-0.5 rounded-full">
                  {RECORRENCIA_LABEL[divida.recorrencia]}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge label={STATUS_LABEL[divida.status] ?? divida.status} cor={cor} />
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

      {!jaQuitado && onMarcarPago && (
        <div className="mt-2.5">
          {!confirmando ? (
            <button
              onClick={() => setConfirmando(true)}
              className="flex items-center gap-1.5 text-xs text-[var(--green)] bg-[rgba(0,229,160,0.08)] border border-[rgba(0,229,160,0.2)] px-3 py-1.5 rounded-lg w-full justify-center"
            >
              <CheckCircle size={13} />
              Marcar parcela paga
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              {divida.recorrencia === 'variavel' && (
                <input
                  type="number"
                  inputMode="decimal"
                  value={novoValor}
                  onChange={e => setNovoValor(e.target.value)}
                  placeholder={`Valor desta parcela (padrão: ${formatBRL(divida.valorParcela)})`}
                  className="w-full bg-[var(--bg)] border border-[var(--border2)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--green)]"
                />
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => { setConfirmando(false); setNovoValor('') }}
                  className="flex-1 py-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--text3)]"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => void handleMarcarPago()}
                  disabled={salvando}
                  className="flex-1 py-1.5 rounded-lg bg-[var(--green)] text-[#0a0a0f] text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-60"
                >
                  {salvando ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                  Confirmar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
