import { useState } from 'react'
import { useFluxo } from '../hooks/useFluxo'
import { Header } from '../components/layout/Header'
import { FluxoTimeline } from '../components/fluxo/FluxoTimeline'
import { Chip } from '../components/ui/Chip'
import { formatBRL } from '../utils/formatCurrency'

const PERIODOS = [
  { label: '30 dias', meses: 1 },
  { label: '60 dias', meses: 2 },
  { label: '90 dias', meses: 3 },
]

export function FluxoPage() {
  const [periodo, setPeriodo] = useState(1)
  const { eventos } = useFluxo(periodo)

  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() + periodo)
  const cutoffISO = cutoff.toISOString().slice(0, 10)

  const eventosFiltrados = eventos.filter(e => e.data <= cutoffISO)
  const ultimoEvento = eventosFiltrados.at(-1)
  const saldoFinal = ultimoEvento?.saldoApos ?? 0
  const saldoAtual = eventos.find(e => e.tipo === 'hoje')?.saldoApos ?? 0

  const corSaldo = saldoFinal >= saldoAtual ? 'text-[var(--green)]' : 'text-[var(--red)]'

  return (
    <div className="flex flex-col flex-1 pb-20">
      <Header titulo="Fluxo de Caixa" />

      <div className="px-4 py-2">
        <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-3 mb-3">
          <p className="text-xs text-[var(--text3)] mb-0.5">Saldo projetado final</p>
          <p className={`font-mono text-2xl font-bold ${corSaldo}`}>{formatBRL(saldoFinal)}</p>
        </div>
        <div className="flex gap-2">
          {PERIODOS.map(p => (
            <Chip
              key={p.meses}
              label={p.label}
              ativo={periodo === p.meses}
              onClick={() => setPeriodo(p.meses)}
            />
          ))}
        </div>
      </div>

      <FluxoTimeline eventos={eventosFiltrados} />
    </div>
  )
}
