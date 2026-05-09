import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import type { RendaMensal } from '../../db/types'
import { formatBRLCompact } from '../../utils/formatCurrency'

interface GraficoMargemProps {
  dados: RendaMensal[]
}

export function GraficoMargem({ dados }: GraficoMargemProps) {
  const ordenados = [...dados]
    .sort((a, b) => a.mesAno.localeCompare(b.mesAno))
    .map(d => {
      const [ano, mes] = d.mesAno.split('-')
      const data = new Date(Number(ano), Number(mes) - 1, 1)
      return {
        mes: data.toLocaleDateString('pt-BR', { month: 'short' }),
        margem: d.margemReal,
        comprometido: d.totalComprometido,
      }
    })

  if (ordenados.length === 0) {
    return (
      <div className="mx-4 bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-center h-40">
        <p className="text-sm text-[var(--text3)]">Sem histórico disponível</p>
      </div>
    )
  }

  return (
    <div className="mx-4 bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-4">
      <p className="text-xs font-medium text-[var(--text2)] mb-3">Histórico de Margem</p>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={ordenados} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="mes" tick={{ fill: 'var(--text3)', fontSize: 11 }} />
          <YAxis tickFormatter={v => formatBRLCompact(v as number)} tick={{ fill: 'var(--text3)', fontSize: 10 }} />
          <Tooltip
            formatter={(value: unknown) => formatBRLCompact(typeof value === 'number' ? value : 0)}
            contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text2)' }} />
          <Line type="monotone" dataKey="margem" name="Margem" stroke="var(--green)" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="comprometido" name="Comprometido" stroke="var(--red)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
