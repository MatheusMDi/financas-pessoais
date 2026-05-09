import type { GastoVariavel, Categoria } from '../db/types'

export interface Periodo {
  inicio: string
  fim: string
  label: string
}

export function periodoEsteMes(): Periodo {
  const hoje = new Date()
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10)
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().slice(0, 10)
  const label = hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return { inicio, fim, label }
}

export function periodoUltimos30(): Periodo {
  const hoje = new Date()
  const ini = new Date(hoje)
  ini.setDate(ini.getDate() - 29)
  return {
    inicio: ini.toISOString().slice(0, 10),
    fim: hoje.toISOString().slice(0, 10),
    label: 'Últimos 30 dias',
  }
}

export function periodoAnterior(p: Periodo): Periodo {
  const ini = new Date(p.inicio + 'T00:00:00')
  const fim = new Date(p.fim + 'T00:00:00')
  const diff = fim.getTime() - ini.getTime()
  const prevFim = new Date(ini.getTime() - 86_400_000)
  const prevIni = new Date(prevFim.getTime() - diff)
  return {
    inicio: prevIni.toISOString().slice(0, 10),
    fim: prevFim.toISOString().slice(0, 10),
    label: 'Período anterior',
  }
}

export interface KPIs {
  totalReceitas: number
  totalDespesas: number
  liquidoPeriodo: number
  percentualComprometido: number
  maiorGastoCategoria: string
  maiorGastoValor: number
  receitasVar: number
  despesasVar: number
}

export interface DiaFluxo {
  data: string
  label: string
  receitas: number
  despesas: number
  liquido: number
  saldo: number
}

export interface SemanaFluxo {
  label: string
  receitas: number
  despesas: number
  liquido: number
}

export interface CategoriaBreakdown {
  categoriaId: number
  nome: string
  icone: string
  cor: string
  valor: number
  percentual: number
  varVsPrev: number | null
}

export interface DashboardData {
  kpis: KPIs
  diasFluxo: DiaFluxo[]
  semanasFluxo: SemanaFluxo[]
  despesasPorCategoria: CategoriaBreakdown[]
  receitasPorCategoria: CategoriaBreakdown[]
  lancamentos: GastoVariavel[]
  // comparativo
  prevKpis: { totalReceitas: number; totalDespesas: number; liquidoPeriodo: number; percentualComprometido: number }
}

export function calcularDashboard(
  lancamentos: GastoVariavel[],
  lancamentosAnt: GastoVariavel[],
  categorias: Categoria[],
  saldoAtual: number,
  periodo: Periodo,
): DashboardData {
  const totalReceitas = lancamentos.filter(g => g.tipo === 'receita_extra').reduce((s, g) => s + g.valor, 0)
  const totalDespesas = lancamentos.filter(g => g.tipo === 'gasto').reduce((s, g) => s + g.valor, 0)
  const liquidoPeriodo = totalReceitas - totalDespesas
  const percentualComprometido = totalReceitas > 0 ? (totalDespesas / totalReceitas) * 100 : 0

  const prevReceitas = lancamentosAnt.filter(g => g.tipo === 'receita_extra').reduce((s, g) => s + g.valor, 0)
  const prevDespesas = lancamentosAnt.filter(g => g.tipo === 'gasto').reduce((s, g) => s + g.valor, 0)
  const receitasVar = prevReceitas > 0 ? ((totalReceitas - prevReceitas) / prevReceitas) * 100 : 0
  const despesasVar = prevDespesas > 0 ? ((totalDespesas - prevDespesas) / prevDespesas) * 100 : 0

  // Maior gasto
  const gastosPorCat = new Map<number, number>()
  lancamentos.filter(g => g.tipo === 'gasto').forEach(g => {
    gastosPorCat.set(g.categoriaId, (gastosPorCat.get(g.categoriaId) ?? 0) + g.valor)
  })
  let maiorGastoCategoria = '—'
  let maiorGastoValor = 0
  for (const [catId, val] of gastosPorCat) {
    if (val > maiorGastoValor) {
      maiorGastoValor = val
      const cat = categorias.find(c => c.id === catId)
      maiorGastoCategoria = cat ? `${cat.icone} ${cat.nome}` : 'Outros'
    }
  }

  const kpis: KPIs = { totalReceitas, totalDespesas, liquidoPeriodo, percentualComprometido, maiorGastoCategoria, maiorGastoValor, receitasVar, despesasVar }

  // Daily cash flow — reconstruct from saldoAtual backwards
  const hoje = new Date().toISOString().slice(0, 10)
  const netDesdePeriodoAtéHoje = lancamentos
    .filter(g => g.data <= hoje)
    .reduce((s, g) => s + (g.tipo === 'receita_extra' ? g.valor : -g.valor), 0)
  const saldoInicioPeriodo = saldoAtual - netDesdePeriodoAtéHoje

  const diasFluxo: DiaFluxo[] = []
  let runningBalance = saldoInicioPeriodo
  const cursor = new Date(periodo.inicio + 'T00:00:00')
  const fimDate = new Date(periodo.fim + 'T00:00:00')
  while (cursor <= fimDate) {
    const dataStr = cursor.toISOString().slice(0, 10)
    const diaLanc = lancamentos.filter(g => g.data === dataStr)
    const r = diaLanc.filter(g => g.tipo === 'receita_extra').reduce((s, g) => s + g.valor, 0)
    const d = diaLanc.filter(g => g.tipo === 'gasto').reduce((s, g) => s + g.valor, 0)
    runningBalance += r - d
    diasFluxo.push({
      data: dataStr,
      label: cursor.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      receitas: r,
      despesas: d,
      liquido: r - d,
      saldo: runningBalance,
    })
    cursor.setDate(cursor.getDate() + 1)
  }

  // Weekly grouping
  const semanasFluxo: SemanaFluxo[] = []
  for (let i = 0; i < diasFluxo.length; i += 7) {
    const semana = diasFluxo.slice(i, i + 7)
    semanasFluxo.push({
      label: `S${Math.floor(i / 7) + 1}`,
      receitas: semana.reduce((s, d) => s + d.receitas, 0),
      despesas: semana.reduce((s, d) => s + d.despesas, 0),
      liquido: semana.reduce((s, d) => s + d.liquido, 0),
    })
  }

  // Category breakdown — despesas
  const prevGastosPorCat = new Map<number, number>()
  lancamentosAnt.filter(g => g.tipo === 'gasto').forEach(g => {
    prevGastosPorCat.set(g.categoriaId, (prevGastosPorCat.get(g.categoriaId) ?? 0) + g.valor)
  })
  const despesasPorCategoria: CategoriaBreakdown[] = []
  for (const [catId, valor] of gastosPorCat) {
    const cat = categorias.find(c => c.id === catId)
    const prev = prevGastosPorCat.get(catId) ?? 0
    despesasPorCategoria.push({
      categoriaId: catId,
      nome: cat?.nome ?? 'Outros',
      icone: cat?.icone ?? '📋',
      cor: cat?.cor ?? '#888',
      valor,
      percentual: totalDespesas > 0 ? (valor / totalDespesas) * 100 : 0,
      varVsPrev: prev > 0 ? ((valor - prev) / prev) * 100 : null,
    })
  }
  despesasPorCategoria.sort((a, b) => b.valor - a.valor)

  // Category breakdown — receitas
  const receitasPorCat = new Map<number, number>()
  lancamentos.filter(g => g.tipo === 'receita_extra').forEach(g => {
    receitasPorCat.set(g.categoriaId, (receitasPorCat.get(g.categoriaId) ?? 0) + g.valor)
  })
  const prevReceitasPorCat = new Map<number, number>()
  lancamentosAnt.filter(g => g.tipo === 'receita_extra').forEach(g => {
    prevReceitasPorCat.set(g.categoriaId, (prevReceitasPorCat.get(g.categoriaId) ?? 0) + g.valor)
  })
  const receitasPorCategoria: CategoriaBreakdown[] = []
  for (const [catId, valor] of receitasPorCat) {
    const cat = categorias.find(c => c.id === catId)
    const prev = prevReceitasPorCat.get(catId) ?? 0
    receitasPorCategoria.push({
      categoriaId: catId,
      nome: cat?.nome ?? 'Outros',
      icone: cat?.icone ?? '📋',
      cor: cat?.cor ?? '#888',
      valor,
      percentual: totalReceitas > 0 ? (valor / totalReceitas) * 100 : 0,
      varVsPrev: prev > 0 ? ((valor - prev) / prev) * 100 : null,
    })
  }
  receitasPorCategoria.sort((a, b) => b.valor - a.valor)

  const prevKpis = {
    totalReceitas: prevReceitas,
    totalDespesas: prevDespesas,
    liquidoPeriodo: prevReceitas - prevDespesas,
    percentualComprometido: prevReceitas > 0 ? (prevDespesas / prevReceitas) * 100 : 0,
  }

  return { kpis, diasFluxo, semanasFluxo, despesasPorCategoria, receitasPorCategoria, lancamentos, prevKpis }
}
