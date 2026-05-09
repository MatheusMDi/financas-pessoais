import { useState } from 'react'
import { Shield } from 'lucide-react'
import { useMetas } from '../../hooks/useMetas'
import { formatBRL } from '../../utils/formatCurrency'
import { ProgressBar } from '../ui/ProgressBar'

export function ReservaEmergenciaCard() {
  const { metas, registrarAporte } = useMetas()
  const [mostraAporte, setMostraAporte] = useState(false)
  const [valorAporte, setValorAporte] = useState('')
  const [salvando, setSalvando] = useState(false)

  const meta = metas.find(m => m.tipo === 'reserva_emergencia' && m.status !== 'cancelada')
  if (!meta) return null

  const pct = meta.valorAlvo > 0 ? (meta.valorAcumulado / meta.valorAlvo) * 100 : 0
  const mesesCobertos = meta.valorAlvo > 0 ? (meta.valorAcumulado / (meta.valorAlvo / 3)) : 0

  async function handleAporte() {
    if (!meta?.id) return
    const v = parseFloat(valorAporte)
    if (isNaN(v) || v <= 0) return
    setSalvando(true)
    try {
      await registrarAporte(meta.id, v)
      setValorAporte('')
      setMostraAporte(false)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="mx-4 bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-3.5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-[var(--blue)]" />
          <p className="text-xs font-semibold text-[var(--text)] uppercase tracking-widest">Reserva de Emergência</p>
        </div>
        <button
          onClick={() => setMostraAporte(v => !v)}
          className="text-xs text-[var(--blue)] px-2 py-1 rounded-lg bg-[rgba(77,159,255,0.1)]"
        >
          Atualizar saldo
        </button>
      </div>

      <ProgressBar valor={meta.valorAcumulado} total={meta.valorAlvo} cor="blue" />

      <div className="flex items-center justify-between mt-2">
        <p className="font-mono text-xs text-[var(--text2)]">
          {formatBRL(meta.valorAcumulado)} / {formatBRL(meta.valorAlvo)}
        </p>
        <p className="font-mono text-sm font-semibold text-[var(--blue)]">{pct.toFixed(0)}%</p>
      </div>
      <p className="text-xs text-[var(--text3)] mt-0.5">
        Cobre {mesesCobertos.toFixed(1)} meses de despesas · Meta: 3 meses
      </p>

      {mostraAporte && (
        <div className="flex gap-2 mt-3">
          <input
            type="number"
            inputMode="decimal"
            value={valorAporte}
            onChange={e => setValorAporte(e.target.value)}
            placeholder="Novo saldo acumulado (R$)"
            className="flex-1 bg-[var(--bg)] border border-[var(--border2)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--blue)]"
          />
          <button
            onClick={() => void handleAporte()}
            disabled={salvando}
            className="px-3 py-2 rounded-lg bg-[var(--blue)] text-white text-sm font-semibold shrink-0 disabled:opacity-60"
          >
            OK
          </button>
        </div>
      )}
    </div>
  )
}
