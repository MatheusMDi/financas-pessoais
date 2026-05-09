import { useState, useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { formatBRL } from '../../utils/formatCurrency'

const OPCOES_PARCELAS = [1, 2, 3, 6, 10, 12, 18, 24]

interface SimuladorCompraProps {
  margemAtual: number
}

export function SimuladorCompra({ margemAtual }: SimuladorCompraProps) {
  const [valorItem, setValorItem] = useState(5000)
  const [pctEntrada, setPctEntrada] = useState(20)
  const [parcelas, setParcelas] = useState(12)
  const [taxaJuros, setTaxaJuros] = useState(1.99)
  const [aporte, setAporte] = useState('')

  const resultado = useMemo(() => {
    const entrada = valorItem * (pctEntrada / 100)
    const financiado = valorItem - entrada
    const taxa = taxaJuros / 100

    let parcelaMensal: number
    if (taxa === 0 || parcelas === 1) {
      parcelaMensal = financiado / parcelas
    } else {
      parcelaMensal = (financiado * taxa * Math.pow(1 + taxa, parcelas)) / (Math.pow(1 + taxa, parcelas) - 1)
    }

    const margemApos = margemAtual - parcelaMensal
    const pctMargem = margemAtual > 0 ? (parcelaMensal / margemAtual) * 100 : 100

    const aporteExtra = parseFloat(aporte) || 0
    const mesesParaQuitar = aporteExtra > 0 ? Math.ceil(financiado / aporteExtra) : null

    return { entrada, financiado, parcelaMensal, margemApos, pctMargem, mesesParaQuitar }
  }, [valorItem, pctEntrada, parcelas, taxaJuros, margemAtual, aporte])

  const corMargem = resultado.margemApos >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'
  const alertaGrave = resultado.pctMargem > 80

  return (
    <div className="px-4 pb-24 flex flex-col gap-5">
      {/* Valor do item */}
      <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-[var(--text2)]">Valor do item</label>
          <span className="font-mono text-sm font-semibold text-[var(--text)]">{formatBRL(valorItem)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={50000}
          step={500}
          value={valorItem}
          onChange={e => setValorItem(Number(e.target.value))}
          className="w-full accent-[var(--blue)]"
        />
        <input
          type="number"
          inputMode="numeric"
          value={valorItem}
          onChange={e => setValorItem(Math.max(0, Number(e.target.value)))}
          className="mt-2 w-full bg-[var(--bg)] border border-[var(--border2)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--blue)]"
        />
      </div>

      {/* Entrada */}
      <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-[var(--text2)]">Entrada</label>
          <span className="font-mono text-sm font-semibold text-[var(--text)]">{pctEntrada}% · {formatBRL(resultado.entrada)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={pctEntrada}
          onChange={e => setPctEntrada(Number(e.target.value))}
          className="w-full accent-[var(--blue)]"
        />
      </div>

      {/* Parcelas */}
      <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-4">
        <label className="text-sm font-medium text-[var(--text2)] block mb-2">Parcelas</label>
        <div className="flex flex-wrap gap-2">
          {OPCOES_PARCELAS.map(n => (
            <button
              key={n}
              onClick={() => setParcelas(n)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${parcelas === n ? 'bg-[var(--blue)] text-white' : 'bg-[var(--bg)] border border-[var(--border)] text-[var(--text2)]'}`}
            >
              {n}×
            </button>
          ))}
        </div>
      </div>

      {/* Taxa de juros */}
      <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-[var(--text2)]">Taxa mensal</label>
          <span className="font-mono text-sm font-semibold text-[var(--text)]">{taxaJuros}% a.m.</span>
        </div>
        <input
          type="range"
          min={0}
          max={5}
          step={0.1}
          value={taxaJuros}
          onChange={e => setTaxaJuros(Number(Number(e.target.value).toFixed(1)))}
          className="w-full accent-[var(--blue)]"
        />
      </div>

      {/* Resultado */}
      <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-4 flex flex-col gap-3">
        <p className="text-sm font-semibold text-[var(--text)]">Resultado</p>
        <div className="flex justify-between">
          <span className="text-sm text-[var(--text2)]">Parcela mensal</span>
          <span className="font-mono text-sm font-semibold text-[var(--red)]">{formatBRL(resultado.parcelaMensal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-[var(--text2)]">Margem atual</span>
          <span className="font-mono text-sm font-semibold text-[var(--green)]">{formatBRL(margemAtual)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-[var(--text2)]">Margem após</span>
          <span className={`font-mono text-sm font-semibold ${corMargem}`}>{formatBRL(resultado.margemApos)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-[var(--text2)]">% comprometido após</span>
          <span className={`font-mono text-sm font-semibold ${alertaGrave ? 'text-[var(--red)]' : 'text-[var(--yellow)]'}`}>
            {resultado.pctMargem.toFixed(0)}%
          </span>
        </div>
        {alertaGrave && (
          <div className="flex items-center gap-2 bg-[rgba(255,77,106,0.08)] border border-[var(--red)] rounded-lg px-3 py-2">
            <AlertTriangle size={15} className="text-[var(--red)] shrink-0" />
            <p className="text-xs text-[var(--red)]">
              Parcela consome {resultado.pctMargem.toFixed(0)}% da sua margem livre
            </p>
          </div>
        )}
      </div>

      {/* Quitação antecipada */}
      <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-4">
        <label className="text-sm font-medium text-[var(--text2)] block mb-2">Aporte extra mensal para quitar</label>
        <input
          type="number"
          inputMode="numeric"
          value={aporte}
          onChange={e => setAporte(e.target.value)}
          placeholder="Ex: 500"
          className="w-full bg-[var(--bg)] border border-[var(--border2)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--blue)]"
        />
        {resultado.mesesParaQuitar !== null && (
          <p className="mt-2 text-sm text-[var(--text2)]">
            Quita em <span className="font-semibold text-[var(--green)]">{resultado.mesesParaQuitar} meses</span>
          </p>
        )}
      </div>
    </div>
  )
}
