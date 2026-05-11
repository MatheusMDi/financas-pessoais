import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, ReferenceLine,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  TrendingUp, Wallet, ChevronDown, Search,
  ChevronLeft, ChevronRight as ChevronRightIcon, ArrowUpRight, ArrowDownLeft,
} from 'lucide-react'
import { db } from '../../db/database'
import {
  calcularDashboard,
  periodoEsteMes, periodoUltimos30, periodoAnterior,
  type Periodo, type CategoriaBreakdown,
} from '../../services/dashboardService'
import { formatBRL, formatBRLCompact } from '../../utils/formatCurrency'

const DONUT_COLORS = ['#4d9fff', '#00e5a0', '#ff4d6a', '#ffd166', '#b088ff', '#ff9f4d', '#55ccff', '#ff88aa']
const ITEMS_POR_PAGINA = 10

// ─── Variação helper ──────────────────────────────────────────────────────────

function Variacao({ pct, invertida = false }: { pct: number | null; invertida?: boolean }) {
  if (pct === null) return null
  const pos = invertida ? pct < 0 : pct >= 0
  const icon = pct >= 0 ? '▲' : '▼'
  const cor = pos ? 'text-[var(--green)]' : 'text-[var(--red)]'
  return (
    <span className={`text-[9px] font-semibold ${cor}`}>
      {icon} {Math.abs(pct).toFixed(0)}% vs ant.
    </span>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({
  icon: Icon, label, valor, sub, cor = 'var(--text)', variacao, variacaoInvertida,
}: {
  icon: React.ElementType
  label: string
  valor: string
  sub?: string
  cor?: string
  variacao?: number | null
  variacaoInvertida?: boolean
}) {
  return (
    <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-3 flex flex-col gap-1.5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon size={12} style={{ color: cor }} />
          <p className="text-[9px] font-semibold text-[var(--text3)] uppercase tracking-wider">{label}</p>
        </div>
        {variacao !== undefined && <Variacao pct={variacao ?? null} invertida={variacaoInvertida} />}
      </div>
      <p className="font-mono text-sm font-bold leading-none" style={{ color: cor }}>{valor}</p>
      {sub && <p className="text-[9px] text-[var(--text3)] leading-tight truncate">{sub}</p>}
    </div>
  )
}

// ─── Breakdown list item ──────────────────────────────────────────────────────

function BreakdownItem({
  item, total, colorIndex, onClick, isActive,
}: {
  item: CategoriaBreakdown
  total: number
  colorIndex: number
  onClick: () => void
  isActive: boolean
}) {
  const pct = total > 0 ? (item.valor / total) * 100 : 0
  const fillColor = DONUT_COLORS[colorIndex % DONUT_COLORS.length]
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2.5 border-b border-[var(--border)] last:border-0 transition-colors ${isActive ? 'bg-[rgba(77,159,255,0.06)]' : 'hover:bg-[rgba(255,255,255,0.02)]'}`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm shrink-0">{item.icone}</span>
          <p className="text-xs text-[var(--text)] truncate font-medium">{item.nome}</p>
        </div>
        <div className="text-right shrink-0 ml-2">
          <p className="font-mono text-xs font-bold" style={{ color: fillColor }}>{formatBRL(item.valor)}</p>
          <div className="flex items-center justify-end gap-1">
            <span className="text-[9px] text-[var(--text3)]">{pct.toFixed(0)}%</span>
            <Variacao pct={item.varVsPrev} invertida={false} />
          </div>
        </div>
      </div>
      <div className="h-0.5 w-full bg-[var(--bg)] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: fillColor }} />
      </div>
    </button>
  )
}

// ─── Seletor de Período ───────────────────────────────────────────────────────

function PeriodSelector({
  tipo,
  periodoCustom,
  onTipo,
  onCustom,
}: {
  tipo: 'mes' | '30dias' | 'personalizado'
  periodoCustom: { inicio: string; fim: string }
  onTipo: (t: 'mes' | '30dias' | 'personalizado') => void
  onCustom: (v: { inicio: string; fim: string }) => void
}) {
  return (
    <div className="px-4 mb-3">
      <div className="flex bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-1 gap-1">
        {(['mes', '30dias', 'personalizado'] as const).map(t => (
          <button
            key={t}
            onClick={() => onTipo(t)}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all whitespace-nowrap ${
              tipo === t ? 'bg-[var(--blue)] text-[var(--on-accent)]' : 'text-[var(--text3)]'
            }`}
          >
            {t === 'mes' ? 'Este mês' : t === '30dias' ? 'Últimos 30d' : 'Custom'}
          </button>
        ))}
      </div>
      {tipo === 'personalizado' && (
        <div className="flex gap-2 mt-2">
          <input
            type="date"
            value={periodoCustom.inicio}
            onChange={e => onCustom({ ...periodoCustom, inicio: e.target.value })}
            className="flex-1 bg-[var(--bg)] border border-[var(--border2)] rounded-lg px-2 py-1.5 text-xs text-[var(--text)] outline-none focus:border-[var(--blue)]"
          />
          <span className="text-[var(--text3)] self-center text-xs">→</span>
          <input
            type="date"
            value={periodoCustom.fim}
            onChange={e => onCustom({ ...periodoCustom, fim: e.target.value })}
            className="flex-1 bg-[var(--bg)] border border-[var(--border2)] rounded-lg px-2 py-1.5 text-xs text-[var(--text)] outline-none focus:border-[var(--blue)]"
          />
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AtualTab() {
  const hoje = new Date()

  const [periodoTipo, setPeriodoTipo] = useState<'mes' | '30dias' | 'personalizado'>('mes')
  const [periodoCustom, setPeriodoCustom] = useState({ inicio: '', fim: '' })
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | null>(null)
  const [tabFiltro, setTabFiltro] = useState<'todos' | 'receitas' | 'despesas'>('todos')
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(0)
  const [comparativoAberto, setComparativoAberto] = useState(false)

  const periodo: Periodo = useMemo(() => {
    if (periodoTipo === 'mes') return periodoEsteMes()
    if (periodoTipo === '30dias') return periodoUltimos30()
    if (periodoCustom.inicio && periodoCustom.fim) {
      return { inicio: periodoCustom.inicio, fim: periodoCustom.fim, label: 'Personalizado' }
    }
    return periodoEsteMes()
  }, [periodoTipo, periodoCustom])

  const periodoPrev = useMemo(() => periodoAnterior(periodo), [periodo])

  const lancamentos = useLiveQuery(
    () => db.gastosVariaveis.where('data').between(periodo.inicio, periodo.fim, true, true).toArray(),
    [periodo.inicio, periodo.fim]
  )

  const lancamentosAnt = useLiveQuery(
    () => db.gastosVariaveis.where('data').between(periodoPrev.inicio, periodoPrev.fim, true, true).toArray(),
    [periodoPrev.inicio, periodoPrev.fim]
  )

  const categorias = useLiveQuery(() => db.categorias.toArray(), []) ?? []
  const configuracoes = useLiveQuery(() => db.configuracoes.toArray(), []) ?? []

  const saldoAtual = useMemo(() => {
    const cfg = configuracoes.find(c => c.chave === 'saldoAtual')
    return cfg ? parseFloat(cfg.valor) || 0 : 0
  }, [configuracoes])

  const dash = useMemo(() => {
    if (!lancamentos || !lancamentosAnt) return null
    return calcularDashboard(lancamentos, lancamentosAnt, categorias, saldoAtual, periodo)
  }, [lancamentos, lancamentosAnt, categorias, saldoAtual, periodo])

  // Transaction table
  const lancsFiltrados = useMemo(() => {
    if (!dash) return []
    let items = [...dash.lancamentos]
    if (tabFiltro === 'receitas') items = items.filter(g => g.tipo === 'receita_extra')
    if (tabFiltro === 'despesas') items = items.filter(g => g.tipo === 'gasto')
    if (categoriaFiltro !== null) items = items.filter(g => g.categoriaId === categoriaFiltro)
    if (busca) items = items.filter(g => (g.descricao ?? '').toLowerCase().includes(busca.toLowerCase()))
    return items.sort((a, b) => b.data.localeCompare(a.data))
  }, [dash, tabFiltro, categoriaFiltro, busca])

  const totalPaginas = Math.ceil(lancsFiltrados.length / ITEMS_POR_PAGINA)
  const lancsPaginados = lancsFiltrados.slice(pagina * ITEMS_POR_PAGINA, (pagina + 1) * ITEMS_POR_PAGINA)

  // Resetar página ao mudar filtros
  const handleFiltroChange = (fn: () => void) => {
    fn()
    setPagina(0)
  }

  const headerSubtitulo = `Atualizado em ${hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`

  if (!dash) {
    return (
      <div className="px-4 py-8 flex items-center justify-center">
        <p className="text-sm text-[var(--text3)]">Carregando dados...</p>
      </div>
    )
  }

  const { kpis, diasFluxo, semanasFluxo, despesasPorCategoria, receitasPorCategoria, prevKpis } = dash

  const pctBar = Math.min(kpis.percentualComprometido, 100)
  const barColor = pctBar < 60 ? 'var(--green)' : pctBar < 80 ? 'var(--yellow)' : 'var(--red)'

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Subtítulo */}
      <p className="px-4 -mt-2 text-[10px] text-[var(--text3)]">{headerSubtitulo}</p>

      {/* Seletor de período */}
      <PeriodSelector
        tipo={periodoTipo}
        periodoCustom={periodoCustom}
        onTipo={t => { setPeriodoTipo(t); setPagina(0) }}
        onCustom={setPeriodoCustom}
      />

      {/* ── KPI Grid 2×3 ──────────────────────────────── */}
      <div className="px-4 grid grid-cols-2 gap-2">
        <KPICard
          icon={Wallet}
          label="Saldo atual"
          valor={formatBRL(saldoAtual)}
          cor={saldoAtual >= 0 ? 'var(--green)' : 'var(--red)'}
        />
        <KPICard
          icon={ArrowUpRight}
          label="Receitas"
          valor={formatBRL(kpis.totalReceitas)}
          cor="var(--green)"
          variacao={kpis.receitasVar}
        />
        <KPICard
          icon={ArrowDownLeft}
          label="Despesas"
          valor={formatBRL(kpis.totalDespesas)}
          cor="var(--red)"
          variacao={kpis.despesasVar}
          variacaoInvertida
        />
        <KPICard
          icon={TrendingUp}
          label="Resultado"
          valor={formatBRL(kpis.liquidoPeriodo)}
          cor={kpis.liquidoPeriodo >= 0 ? 'var(--green)' : 'var(--red)'}
        />
        <div className="col-span-2 bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-3 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-semibold text-[var(--text3)] uppercase tracking-wider">% Comprometido</p>
            <p className="text-[10px] font-bold" style={{ color: barColor }}>{pctBar.toFixed(0)}%</p>
          </div>
          <div className="h-2 w-full bg-[var(--bg)] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pctBar}%`, background: barColor }} />
          </div>
        </div>
        <div className="col-span-2 bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-3 animate-fade-in">
          <p className="text-[9px] font-semibold text-[var(--text3)] uppercase tracking-wider mb-1">Maior gasto do período</p>
          <p className="text-sm font-semibold text-[var(--text)]">{kpis.maiorGastoCategoria}</p>
          {kpis.maiorGastoValor > 0 && (
            <p className="font-mono text-xs text-[var(--red)] mt-0.5">{formatBRL(kpis.maiorGastoValor)}</p>
          )}
        </div>
      </div>

      {/* ── Gráfico: Fluxo de Caixa Diário ────────────── */}
      <div className="mx-4 bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-4">
        <p className="text-xs font-semibold text-[var(--text)] mb-3">Fluxo de caixa diário</p>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={diasFluxo} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="gradSaldo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4d9fff" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#4d9fff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradNeg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff4d6a" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ff4d6a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--text3)', fontSize: 8 }}
              interval={Math.max(0, Math.floor(diasFluxo.length / 6) - 1)}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={v => formatBRLCompact(v as number)}
              tick={{ fill: 'var(--text3)', fontSize: 8 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                const dia = diasFluxo.find(d => d.label === label)
                if (!dia) return null
                return (
                  <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs shadow-xl">
                    <p className="text-[var(--text3)] mb-1 font-medium">{label}</p>
                    {dia.receitas > 0 && <p className="text-[var(--green)] font-mono">+{formatBRL(dia.receitas)}</p>}
                    {dia.despesas > 0 && <p className="text-[var(--red)] font-mono">-{formatBRL(dia.despesas)}</p>}
                    <p className="font-mono font-bold mt-1 pt-1 border-t border-[var(--border)]"
                      style={{ color: dia.saldo >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {formatBRL(dia.saldo)}
                    </p>
                  </div>
                )
              }}
            />
            <ReferenceLine y={0} stroke="var(--red)" strokeDasharray="3 3" strokeWidth={1} />
            <Area
              type="monotone"
              dataKey="saldo"
              stroke="var(--blue)"
              strokeWidth={2}
              fill="url(#gradSaldo)"
              dot={false}
              activeDot={{ r: 3, fill: 'var(--blue)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Gráfico: Receitas vs Despesas por Semana ──── */}
      {semanasFluxo.length > 1 && (
        <div className="mx-4 bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-xs font-semibold text-[var(--text)] mb-3">Receitas × Despesas por semana</p>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={semanasFluxo} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'var(--text3)', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => formatBRLCompact(v as number)} tick={{ fill: 'var(--text3)', fontSize: 8 }} axisLine={false} tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  const r = (payload.find(p => p.name === 'Receitas')?.value as number) ?? 0
                  const d = (payload.find(p => p.name === 'Despesas')?.value as number) ?? 0
                  return (
                    <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs shadow-xl">
                      <p className="text-[var(--text3)] mb-1">{label}</p>
                      <p className="text-[var(--green)] font-mono">+{formatBRL(r)}</p>
                      <p className="text-[var(--red)] font-mono">-{formatBRL(d)}</p>
                      <p className="font-mono font-semibold mt-1" style={{ color: r - d >= 0 ? 'var(--green)' : 'var(--red)' }}>
                        {formatBRL(r - d)}
                      </p>
                    </div>
                  )
                }}
              />
              <Bar dataKey="Receitas" fill="var(--green)" opacity={0.85} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Despesas" fill="var(--red)" opacity={0.85} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Breakdown: Despesas por Categoria ─────────── */}
      {despesasPorCategoria.length > 0 && (
        <div className="mx-4">
          <p className="text-[10px] font-semibold text-[var(--text3)] uppercase tracking-widest mb-2">
            Despesas por categoria
            {categoriaFiltro !== null && (
              <button onClick={() => { setCategoriaFiltro(null); setPagina(0) }} className="ml-2 text-[var(--blue)] normal-case">
                × limpar filtro
              </button>
            )}
          </p>
          <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="flex gap-4 p-4 border-b border-[var(--border)]">
              {/* Donut */}
              <div className="shrink-0">
                <PieChart width={100} height={100}>
                  <Pie
                    data={despesasPorCategoria.slice(0, 8)}
                    cx={45}
                    cy={45}
                    innerRadius={28}
                    outerRadius={45}
                    dataKey="valor"
                    strokeWidth={0}
                  >
                    {despesasPorCategoria.slice(0, 8).map((_, idx) => (
                      <Cell key={idx} fill={DONUT_COLORS[idx % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
              <div className="flex flex-col justify-center gap-1 min-w-0">
                <p className="text-[10px] text-[var(--text3)]">Total despesas</p>
                <p className="font-mono text-base font-bold text-[var(--red)]">{formatBRL(kpis.totalDespesas)}</p>
                <p className="text-[10px] text-[var(--text3)]">{despesasPorCategoria.length} categorias</p>
              </div>
            </div>
            {despesasPorCategoria.map((item, idx) => (
              <BreakdownItem
                key={item.categoriaId}
                item={item}
                total={kpis.totalDespesas}
                colorIndex={idx}
                onClick={() => handleFiltroChange(() => setCategoriaFiltro(categoriaFiltro === item.categoriaId ? null : item.categoriaId))}
                isActive={categoriaFiltro === item.categoriaId}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Breakdown: Receitas por Fonte ─────────────── */}
      {receitasPorCategoria.length > 0 && (
        <div className="mx-4">
          <p className="text-[10px] font-semibold text-[var(--text3)] uppercase tracking-widest mb-2">Receitas por fonte</p>
          <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="flex gap-4 p-4 border-b border-[var(--border)]">
              <div className="shrink-0">
                <PieChart width={100} height={100}>
                  <Pie
                    data={receitasPorCategoria.slice(0, 8)}
                    cx={45}
                    cy={45}
                    innerRadius={28}
                    outerRadius={45}
                    dataKey="valor"
                    strokeWidth={0}
                  >
                    {receitasPorCategoria.slice(0, 8).map((_, idx) => (
                      <Cell key={idx} fill={DONUT_COLORS[idx % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
              <div className="flex flex-col justify-center gap-1 min-w-0">
                <p className="text-[10px] text-[var(--text3)]">Total receitas</p>
                <p className="font-mono text-base font-bold text-[var(--green)]">{formatBRL(kpis.totalReceitas)}</p>
                <p className="text-[10px] text-[var(--text3)]">{receitasPorCategoria.length} fontes</p>
              </div>
            </div>
            {receitasPorCategoria.map((item, idx) => (
              <BreakdownItem
                key={item.categoriaId}
                item={item}
                total={kpis.totalReceitas}
                colorIndex={idx}
                onClick={() => {}}
                isActive={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Tabela de Lançamentos ──────────────────────── */}
      <div className="mx-4">
        <p className="text-[10px] font-semibold text-[var(--text3)] uppercase tracking-widest mb-2">Lançamentos do período</p>

        {/* Filtros */}
        <div className="flex gap-2 mb-2">
          {(['todos', 'receitas', 'despesas'] as const).map(f => (
            <button
              key={f}
              onClick={() => handleFiltroChange(() => setTabFiltro(f))}
              className={`px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all ${
                tabFiltro === f ? 'bg-[var(--blue)] text-[var(--on-accent)]' : 'bg-[var(--bg3)] border border-[var(--border)] text-[var(--text3)]'
              }`}
            >
              {f === 'todos' ? 'Todos' : f === 'receitas' ? 'Receitas' : 'Despesas'}
            </button>
          ))}
        </div>

        {/* Busca */}
        <div className="flex items-center gap-2 bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-3 py-2 mb-2">
          <Search size={13} className="text-[var(--text3)] shrink-0" />
          <input
            value={busca}
            onChange={e => handleFiltroChange(() => setBusca(e.target.value))}
            placeholder="Buscar por descrição..."
            className="flex-1 bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--text3)]"
          />
          {busca && (
            <button onClick={() => handleFiltroChange(() => setBusca(''))} className="text-[var(--text3)] text-xs">×</button>
          )}
        </div>

        <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl overflow-hidden">
          {lancsPaginados.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-[var(--text3)]">Nenhum lançamento encontrado</p>
            </div>
          ) : (
            lancsPaginados.map((g, i) => {
              const cat = categorias.find(c => c.id === g.categoriaId)
              const isReceita = g.tipo === 'receita_extra'
              return (
                <div
                  key={g.id ?? i}
                  className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] last:border-0"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">{cat?.icone ?? '📋'}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-[var(--text)] truncate font-medium">
                        {g.descricao || cat?.nome || 'Lançamento'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-[9px] text-[var(--text3)]">
                          {new Date(g.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </p>
                        {cat && <p className="text-[9px] text-[var(--text3)]">• {cat.nome}</p>}
                      </div>
                    </div>
                  </div>
                  <p
                    className="font-mono text-xs font-bold shrink-0 ml-2"
                    style={{ color: isReceita ? 'var(--green)' : 'var(--red)' }}
                  >
                    {isReceita ? '+' : '-'}{formatBRL(g.valor)}
                  </p>
                </div>
              )
            })
          )}
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between mt-2 px-1">
            <button
              onClick={() => setPagina(p => Math.max(0, p - 1))}
              disabled={pagina === 0}
              className="flex items-center gap-1 text-xs text-[var(--blue)] disabled:text-[var(--text3)] disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            <p className="text-[10px] text-[var(--text3)]">
              {pagina + 1} / {totalPaginas} ({lancsFiltrados.length} itens)
            </p>
            <button
              onClick={() => setPagina(p => Math.min(totalPaginas - 1, p + 1))}
              disabled={pagina >= totalPaginas - 1}
              className="flex items-center gap-1 text-xs text-[var(--blue)] disabled:text-[var(--text3)] disabled:cursor-not-allowed"
            >
              Próxima <ChevronRightIcon size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ── Comparativo com Período Anterior ──────────── */}
      <div className="mx-4">
        <button
          onClick={() => setComparativoAberto(v => !v)}
          className="flex items-center justify-between w-full px-4 py-3 bg-[var(--bg3)] border border-[var(--border)] rounded-xl text-[var(--text)]"
        >
          <p className="text-xs font-semibold">Comparativo com período anterior</p>
          <ChevronDown size={14} className={`text-[var(--text3)] transition-transform ${comparativoAberto ? 'rotate-180' : ''}`} />
        </button>
        {comparativoAberto && (
          <div className="mt-2 bg-[var(--bg3)] border border-[var(--border)] rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--bg)]">
              <p className="text-[9px] font-semibold text-[var(--text3)] uppercase tracking-wide">Métrica</p>
              <p className="text-[9px] font-semibold text-[var(--blue)] uppercase tracking-wide text-center">Atual</p>
              <p className="text-[9px] font-semibold text-[var(--text3)] uppercase tracking-wide text-center">Anterior</p>
            </div>
            {[
              { label: 'Receitas', atual: kpis.totalReceitas, prev: prevKpis.totalReceitas, cor: 'var(--green)', melhorMais: true },
              { label: 'Despesas', atual: kpis.totalDespesas, prev: prevKpis.totalDespesas, cor: 'var(--red)', melhorMais: false },
              { label: 'Resultado', atual: kpis.liquidoPeriodo, prev: prevKpis.liquidoPeriodo, cor: kpis.liquidoPeriodo >= 0 ? 'var(--green)' : 'var(--red)', melhorMais: true },
              { label: '% Comprometido', atual: kpis.percentualComprometido, prev: prevKpis.percentualComprometido, cor: 'var(--text)', melhorMais: false, isPct: true },
            ].map(row => {
              const diff = row.atual - row.prev
              const diffPct = row.prev !== 0 ? (diff / Math.abs(row.prev)) * 100 : 0
              const melhorou = row.melhorMais ? diff > 0 : diff < 0
              return (
                <div key={row.label} className="grid grid-cols-3 items-center px-4 py-3 border-b border-[var(--border)] last:border-0">
                  <p className="text-xs text-[var(--text2)]">{row.label}</p>
                  <p className="font-mono text-xs font-bold text-center" style={{ color: row.cor }}>
                    {'isPct' in row && row.isPct ? `${row.atual.toFixed(0)}%` : formatBRLCompact(row.atual)}
                  </p>
                  <div className="text-center">
                    <p className="font-mono text-xs text-[var(--text3)]">
                      {'isPct' in row && row.isPct ? `${row.prev.toFixed(0)}%` : formatBRLCompact(row.prev)}
                    </p>
                    {row.prev !== 0 && (
                      <p className={`text-[9px] font-semibold ${melhorou ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                        {diff > 0 ? '▲' : '▼'} {Math.abs(diffPct).toFixed(0)}%
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
