import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
import { formatBRLCompact } from '../../utils/formatCurrency'

interface GraficoSemanalProps {
  mesAno?: string // "2026-05"
}

function inicioSemana(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function GraficoSemanal({ mesAno }: GraficoSemanalProps) {
  const hoje = new Date()
  const [mes, setMes] = useState(mesAno ?? hoje.toISOString().slice(0, 7))

  const inicioMes = `${mes}-01`
  const fimMes = `${mes}-31`

  const gastos = useLiveQuery(() =>
    db.gastosVariaveis.where('data').between(inicioMes, fimMes, true, true).toArray()
  , [mes]) ?? []

  const categorias = useLiveQuery(() => db.categorias.toArray(), []) ?? []

  const dados = useMemo(() => {
    if (gastos.length === 0) return []

    const gastosGasto = gastos.filter(g => g.tipo === 'gasto')
    const porCategoria = new Map<number, number>()
    gastosGasto.forEach(g => {
      porCategoria.set(g.categoriaId, (porCategoria.get(g.categoriaId) ?? 0) + g.valor)
    })

    const top5 = [...porCategoria.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id)

    const semanas: Record<string, Record<string, number>> = {}

    gastosGasto.forEach(g => {
      const d = new Date(g.data + 'T12:00:00')
      const inicio = inicioSemana(d)
      const key = `${inicio.getDate()}/${inicio.getMonth() + 1}`
      if (!semanas[key]) semanas[key] = {}
      const catId = top5.includes(g.categoriaId) ? g.categoriaId : -1
      semanas[key][catId] = (semanas[key][catId] ?? 0) + g.valor
    })

    return Object.entries(semanas).map(([semana, valores]) => ({
      semana,
      ...valores,
    }))
  }, [gastos])

  const categorias5 = useMemo(() => {
    if (gastos.length === 0) return []
    const porCategoria = new Map<number, number>()
    gastos.filter(g => g.tipo === 'gasto').forEach(g => {
      porCategoria.set(g.categoriaId, (porCategoria.get(g.categoriaId) ?? 0) + g.valor)
    })
    return [...porCategoria.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => categorias.find(c => c.id === id))
      .filter(Boolean) as typeof categorias
  }, [gastos, categorias])

  const mesesDisponiveis = useMemo(() => {
    const atual = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(atual.getFullYear(), atual.getMonth() - i, 1)
      return d.toISOString().slice(0, 7)
    })
  }, [])

  if (dados.length === 0) {
    return (
      <div className="mx-4 bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-4">
        <p className="text-xs font-medium text-[var(--text2)] mb-2">Gastos por semana</p>
        <div className="flex items-center justify-center h-32 text-[var(--text3)] text-sm">
          Nenhum lançamento no período
        </div>
      </div>
    )
  }

  return (
    <div className="mx-4 bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-[var(--text2)]">Gastos por semana</p>
        <select
          value={mes}
          onChange={e => setMes(e.target.value)}
          className="text-xs bg-[var(--bg)] border border-[var(--border)] rounded-lg px-2 py-1 text-[var(--text2)] outline-none"
        >
          {mesesDisponiveis.map(m => {
            const [y, mo] = m.split('-')
            const label = new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
            return <option key={m} value={m} className="bg-[var(--bg3)]">{label}</option>
          })}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={dados} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis dataKey="semana" tick={{ fill: 'var(--text3)', fontSize: 10 }} />
          <YAxis tickFormatter={v => formatBRLCompact(v as number)} tick={{ fill: 'var(--text3)', fontSize: 10 }} />
          <Tooltip
            formatter={(value: unknown, name: unknown) => {
              const cat = categorias5.find(c => String(c.id) === String(name ?? ''))
              return [formatBRLCompact(typeof value === 'number' ? value : 0), cat?.nome ?? 'Outros']
            }}
            contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8 }}
          />
          <Legend
            formatter={(value) => {
              const cat = categorias5.find(c => String(c.id) === value)
              return cat?.nome ?? 'Outros'
            }}
            wrapperStyle={{ fontSize: 10, color: 'var(--text2)' }}
          />
          {categorias5.map(cat => (
            <Bar key={cat.id} dataKey={String(cat.id)} stackId="a" fill={cat.cor} />
          ))}
          <Bar dataKey="-1" stackId="a" fill="var(--text3)" name="outros" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
