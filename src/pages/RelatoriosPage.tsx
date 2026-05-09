import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ComposedChart, Line } from 'recharts'
import { ChevronDown, ChevronRight, TrendingDown, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react'
import { db } from '../db/database'
import { Header } from '../components/layout/Header'
import { formatBRL, formatBRLCompact } from '../utils/formatCurrency'

type Periodo = 'mes_atual' | 'mes_anterior' | 'ultimos_3' | 'ultimos_6' | 'ano_atual' | 'personalizado'

function getMesAno(offset: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() + offset)
  return d.toISOString().slice(0, 7)
}

function periodoLabel(p: Periodo): string {
  const labels: Record<Periodo, string> = {
    mes_atual: 'Este mês',
    mes_anterior: 'Mês anterior',
    ultimos_3: 'Últimos 3 meses',
    ultimos_6: 'Últimos 6 meses',
    ano_atual: 'Este ano',
    personalizado: 'Personalizado',
  }
  return labels[p]
}

export function RelatoriosPage() {
  const [periodo, setPeriodo] = useState<Periodo>('mes_atual')
  const [customInicio, setCustomInicio] = useState(getMesAno(0))
  const [customFim, setCustomFim] = useState(getMesAno(0))
  const [expandedCat, setExpandedCat] = useState<number | null>(null)
  const [showPeriodoMenu, setShowPeriodoMenu] = useState(false)

  const hoje = new Date()
  const anoAtual = hoje.getFullYear()

  const { dataInicio, dataFim } = useMemo(() => {
    switch (periodo) {
      case 'mes_atual': {
        const m = getMesAno(0)
        return { dataInicio: `${m}-01`, dataFim: `${m}-31` }
      }
      case 'mes_anterior': {
        const m = getMesAno(-1)
        return { dataInicio: `${m}-01`, dataFim: `${m}-31` }
      }
      case 'ultimos_3': {
        const inicio = getMesAno(-2)
        const fim = getMesAno(0)
        return { dataInicio: `${inicio}-01`, dataFim: `${fim}-31` }
      }
      case 'ultimos_6': {
        const inicio = getMesAno(-5)
        const fim = getMesAno(0)
        return { dataInicio: `${inicio}-01`, dataFim: `${fim}-31` }
      }
      case 'ano_atual':
        return { dataInicio: `${anoAtual}-01-01`, dataFim: `${anoAtual}-12-31` }
      case 'personalizado':
        return { dataInicio: `${customInicio}-01`, dataFim: `${customFim}-31` }
    }
  }, [periodo, customInicio, customFim, anoAtual])

  const gastos = useLiveQuery(() =>
    db.gastosVariaveis.where('data').between(dataInicio, dataFim, true, true).toArray()
  , [dataInicio, dataFim]) ?? []

  const categorias = useLiveQuery(() => db.categorias.toArray(), []) ?? []
  const subcategorias = useLiveQuery(() => db.subcategorias.toArray(), []) ?? []

  const totalGastos = useMemo(
    () => gastos.filter(g => g.tipo === 'gasto').reduce((s, g) => s + g.valor, 0),
    [gastos]
  )
  const totalReceitas = useMemo(
    () => gastos.filter(g => g.tipo === 'receita_extra').reduce((s, g) => s + g.valor, 0),
    [gastos]
  )
  const qtdLancamentos = gastos.filter(g => g.tipo === 'gasto').length
  const ticketMedio = qtdLancamentos > 0 ? totalGastos / qtdLancamentos : 0

  const porCategoria = useMemo(() => {
    const map = new Map<number, number>()
    gastos.filter(g => g.tipo === 'gasto').forEach(g => {
      map.set(g.categoriaId, (map.get(g.categoriaId) ?? 0) + g.valor)
    })
    return [...map.entries()]
      .map(([id, valor]) => ({
        cat: categorias.find(c => c.id === id),
        id,
        valor,
      }))
      .filter(x => x.cat)
      .sort((a, b) => b.valor - a.valor)
  }, [gastos, categorias])

  const porMes = useMemo(() => {
    const map = new Map<string, { gastos: number; receitas: number }>()
    gastos.forEach(g => {
      const mes = g.data.slice(0, 7)
      if (!map.has(mes)) map.set(mes, { gastos: 0, receitas: 0 })
      const entry = map.get(mes)!
      if (g.tipo === 'gasto') entry.gastos += g.valor
      else entry.receitas += g.valor
    })
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mesAno, vals]) => {
        const [y, m] = mesAno.split('-')
        const label = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('pt-BR', { month: 'short' })
        return { label, ...vals }
      })
  }, [gastos])

  const periodoAnterior = useMemo(() => {
    const meses = porMes.length || 1
    const offsetInicio = -(meses * 2)
    const offsetFim = -(meses + 1)
    const ini = getMesAno(offsetInicio)
    const fim = getMesAno(offsetFim)
    return { ini: `${ini}-01`, fim: `${fim}-31` }
  }, [porMes.length])

  const gastosAnteriores = useLiveQuery(() =>
    db.gastosVariaveis.where('data').between(periodoAnterior.ini, periodoAnterior.fim, true, true).toArray()
  , [periodoAnterior.ini, periodoAnterior.fim]) ?? []

  const totalGastosAnterior = useMemo(
    () => gastosAnteriores.filter(g => g.tipo === 'gasto').reduce((s, g) => s + g.valor, 0),
    [gastosAnteriores]
  )
  const variacaoGastos = totalGastosAnterior > 0 ? ((totalGastos - totalGastosAnterior) / totalGastosAnterior) * 100 : null

  return (
    <div className="flex flex-col flex-1 pb-24">
      <Header titulo="Relatórios" />

      {/* Period selector */}
      <div className="px-4 mb-4">
        <div className="relative">
          <button
            onClick={() => setShowPeriodoMenu(v => !v)}
            className="flex items-center justify-between w-full px-4 py-3 bg-[var(--bg3)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)]"
          >
            <span>{periodoLabel(periodo)}</span>
            <ChevronDown size={16} className={`transition-transform text-[var(--text3)] ${showPeriodoMenu ? 'rotate-180' : ''}`} />
          </button>
          {showPeriodoMenu && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--bg2)] border border-[var(--border)] rounded-xl overflow-hidden z-20 shadow-lg">
              {(['mes_atual', 'mes_anterior', 'ultimos_3', 'ultimos_6', 'ano_atual', 'personalizado'] as Periodo[]).map(p => (
                <button
                  key={p}
                  onClick={() => { setPeriodo(p); setShowPeriodoMenu(false) }}
                  className={`flex items-center justify-between w-full px-4 py-3 text-sm border-b border-[var(--border)] last:border-0 ${periodo === p ? 'text-[var(--blue)] bg-[rgba(77,159,255,0.08)]' : 'text-[var(--text)]'}`}
                >
                  {periodoLabel(p)}
                  {periodo === p && <ChevronRight size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {periodo === 'personalizado' && (
          <div className="flex gap-2 mt-2">
            <div className="flex-1">
              <p className="text-xs text-[var(--text3)] mb-1">De</p>
              <input
                type="month"
                value={customInicio}
                onChange={e => setCustomInicio(e.target.value)}
                className="w-full bg-[var(--bg3)] border border-[var(--border2)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none"
              />
            </div>
            <div className="flex-1">
              <p className="text-xs text-[var(--text3)] mb-1">Até</p>
              <input
                type="month"
                value={customFim}
                onChange={e => setCustomFim(e.target.value)}
                className="w-full bg-[var(--bg3)] border border-[var(--border2)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="px-4 grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown size={14} className="text-[var(--red)]" />
            <p className="text-xs text-[var(--text3)]">Total gasto</p>
          </div>
          <p className="font-mono text-base font-bold text-[var(--red)]">{formatBRL(totalGastos)}</p>
          {variacaoGastos !== null && (
            <p className={`text-[10px] mt-0.5 ${variacaoGastos > 0 ? 'text-[var(--red)]' : 'text-[var(--green)]'}`}>
              {variacaoGastos > 0 ? '+' : ''}{variacaoGastos.toFixed(1)}% vs período ant.
            </p>
          )}
        </div>
        <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={14} className="text-[var(--green)]" />
            <p className="text-xs text-[var(--text3)]">Receitas extras</p>
          </div>
          <p className="font-mono text-base font-bold text-[var(--green)]">{formatBRL(totalReceitas)}</p>
          <p className="text-[10px] mt-0.5 text-[var(--text3)]">lançamentos extras</p>
        </div>
        <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <ShoppingBag size={14} className="text-[var(--blue)]" />
            <p className="text-xs text-[var(--text3)]">Lançamentos</p>
          </div>
          <p className="font-mono text-base font-bold text-[var(--text)]">{qtdLancamentos}</p>
          <p className="text-[10px] mt-0.5 text-[var(--text3)]">transações de gasto</p>
        </div>
        <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign size={14} className="text-[var(--yellow)]" />
            <p className="text-xs text-[var(--text3)]">Ticket médio</p>
          </div>
          <p className="font-mono text-base font-bold text-[var(--yellow)]">{formatBRL(ticketMedio)}</p>
          <p className="text-[10px] mt-0.5 text-[var(--text3)]">por lançamento</p>
        </div>
      </div>

      {/* Monthly chart */}
      {porMes.length > 1 && (
        <div className="mx-4 mb-4 bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-xs font-medium text-[var(--text2)] mb-3">Gastos × Receitas por mês</p>
          <ResponsiveContainer width="100%" height={160}>
            <ComposedChart data={porMes} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fill: 'var(--text3)', fontSize: 10 }} />
              <YAxis tickFormatter={v => formatBRLCompact(v as number)} tick={{ fill: 'var(--text3)', fontSize: 10 }} />
              <Tooltip
                formatter={(value: unknown) => formatBRL(typeof value === 'number' ? value : 0)}
                contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }}
              />
              <Bar dataKey="gastos" fill="var(--red)" opacity={0.8} name="Gastos" radius={[3, 3, 0, 0]} />
              <Line dataKey="receitas" stroke="var(--green)" strokeWidth={2} dot={false} name="Receitas" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category breakdown */}
      {porCategoria.length > 0 && (
        <div className="mx-4 mb-4">
          <p className="text-xs font-medium text-[var(--text3)] uppercase tracking-widest mb-3">Por categoria</p>

          {/* Mini bar chart */}
          <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-4 mb-3">
            <ResponsiveContainer width="100%" height={120}>
              <BarChart
                data={porCategoria.slice(0, 6).map(x => ({ nome: x.cat?.icone ?? '?', valor: x.valor, fill: x.cat?.cor ?? 'var(--text3)' }))}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="nome" tick={{ fontSize: 14 }} />
                <YAxis tickFormatter={v => formatBRLCompact(v as number)} tick={{ fill: 'var(--text3)', fontSize: 10 }} />
                <Tooltip
                  formatter={(value: unknown) => formatBRL(typeof value === 'number' ? value : 0)}
                  contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }}
                />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                  {porCategoria.slice(0, 6).map((entry, index) => (
                    <rect key={index} fill={entry.cat?.cor ?? 'var(--text3)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col gap-2">
            {porCategoria.map(({ cat, id, valor }) => {
              const pct = totalGastos > 0 ? (valor / totalGastos) * 100 : 0
              const subs = gastos.filter(g => g.categoriaId === id && g.tipo === 'gasto')
              const isExpanded = expandedCat === id
              const orcamento = cat?.orcamentoMensal ?? 0
              const orcPct = orcamento > 0 ? (valor / orcamento) * 100 : null

              return (
                <div key={id} className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedCat(isExpanded ? null : id)}
                    className="w-full flex items-center justify-between px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-lg">{cat?.icone}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-[var(--text)] truncate">{cat?.nome}</p>
                          <p className="font-mono text-sm font-semibold text-[var(--text)] ml-2">{formatBRL(valor)}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 rounded-full bg-[var(--bg)] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, pct)}%`, backgroundColor: cat?.cor ?? 'var(--text3)' }}
                            />
                          </div>
                          <p className="text-[10px] text-[var(--text3)] shrink-0">{pct.toFixed(0)}% do total</p>
                        </div>
                        {orcPct !== null && (
                          <p className={`text-[10px] mt-0.5 ${orcPct >= 100 ? 'text-[var(--red)]' : orcPct >= 80 ? 'text-[var(--yellow)]' : 'text-[var(--text3)]'}`}>
                            {orcPct.toFixed(0)}% do orçamento ({formatBRL(orcamento)})
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronDown size={14} className={`text-[var(--text3)] ml-2 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && subs.length > 0 && (
                    <div className="border-t border-[var(--border)] px-3 pb-2">
                      {subs
                        .sort((a, b) => b.valor - a.valor)
                        .slice(0, 10)
                        .map(g => {
                          const sub = subcategorias.find(s => s.id === g.subcategoriaId)
                          return (
                            <div key={g.id} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                              <div className="flex items-center gap-1.5">
                                {sub && <span className="text-xs">{sub.icone}</span>}
                                <p className="text-xs text-[var(--text2)]">{g.descricao || sub?.nome || 'Sem descrição'}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-mono text-xs font-semibold text-[var(--text)]">{formatBRL(g.valor)}</p>
                                <p className="text-[10px] text-[var(--text3)]">{new Date(g.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                              </div>
                            </div>
                          )
                        })}
                      {subs.length > 10 && (
                        <p className="text-[10px] text-[var(--text3)] pt-1.5 text-center">+{subs.length - 10} lançamentos</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {gastos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--text3)]">
          <p className="text-sm">Nenhum lançamento no período</p>
          <p className="text-xs mt-1">Selecione outro período ou registre gastos</p>
        </div>
      )}
    </div>
  )
}
