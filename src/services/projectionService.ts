/**
 * Módulo de Projeção Financeira
 * Toda lógica de negócio fica aqui — zero JSX, zero React.
 * Recalcula automaticamente a cada novo lançamento salvo.
 */

import type { Divida, Cartao, Imposto, Meta, GastoVariavel } from '../db/types'

// ─── Tipos Públicos ──────────────────────────────────────────────────────────

export type CategoriaEvento =
  | 'salario'
  | 'divida'
  | 'cartao'
  | 'imposto'
  | 'meta'
  | 'gasto_estimado'

export interface EventoProjecao {
  descricao: string
  valor: number           // positivo = entrada | negativo = saída
  categoria: CategoriaEvento
  referencia?: string
}

export interface DiaProjecao {
  data: string            // YYYY-MM-DD
  saldoFim: number        // saldo acumulado ao fim do dia
  entradas: number        // soma de entradas do dia
  saidas: number          // soma de saídas do dia (valor positivo)
  eventos: EventoProjecao[] // apenas eventos nomeados (sem gasto estimado)
}

export interface MesProjecao {
  mesAno: string          // YYYY-MM
  label: string           // "mai/25"
  entradas: number
  saidas: number
  liquido: number         // entradas − saidas
  saldoFimMes: number
  totalDividas: number
  temSaldoNegativo: boolean
}

export interface ProjecaoKPIs {
  saldoFinalHorizonte: number
  dataFinalHorizonte: string
  menorSaldo: number
  dataMenorSaldo: string
  mesesNegativos: string[]        // YYYY-MM com saldo negativo no mês
  totalDividasHorizonte: number
  proximoSalarioData: string
  proximoSalarioValor: number
  diasAteQuitarTudo: number | null // null = nunca quita no horizonte
}

export interface ProjecaoResult {
  horizonte: { inicio: string; fim: string }
  diasProjecao: DiaProjecao[]
  mesesProjecao: MesProjecao[]
  kpis: ProjecaoKPIs
  /** Retorna o saldo projetado para qualquer data (ISO YYYY-MM-DD) */
  getBalanceAt: (data: string) => number
  /** Snapshot do saldo em N dias a partir de hoje */
  snapshot30: number
  snapshot60: number
  snapshot90: number
  /** Dados amostrados semanalmente para o gráfico de linha */
  dadosGraficoLinha: { data: string; label: string; saldo: number }[]
}

export interface ProjecaoInput {
  saldoAtual: number
  diaRecebimento: number    // dia do mês em que a renda cai
  rendaLiquida: number      // valor líquido mensal
  dividas: Divida[]
  cartoes: Cartao[]
  impostos: Imposto[]
  metas: Meta[]
  gastosVariaveis: GastoVariavel[]  // últimos 90 dias para média de gasto
}

// ─── Utilitários de Data ─────────────────────────────────────────────────────

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function toISO(date: Date): string {
  // Usa data local para evitar problema de fuso UTC
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function dateFromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function labelMes(mesAno: string): string {
  const [y, m] = mesAno.split('-').map(Number)
  const d = new Date(y, m - 1, 1)
  return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
}

// ─── Cálculo do Horizonte ────────────────────────────────────────────────────

function calcularHorizonteFim(
  hoje: Date,
  dividas: Divida[],
  impostos: Imposto[],
  metas: Meta[],
): Date {
  let latestKnown = new Date(hoje)

  // Última parcela de dívidas ativas
  for (const d of dividas) {
    if (d.status === 'quitado') continue
    const restantes = d.parcelasTotais - d.parcelasPagas
    if (restantes <= 0) continue
    // Última parcela: restantes meses a frente no dia vencimentoDia
    const ultima = new Date(
      hoje.getFullYear(),
      hoje.getMonth() + restantes - 1,
      d.vencimentoDia,
    )
    if (ultima > latestKnown) latestKnown = ultima
  }

  // Vencimento de impostos futuros
  for (const i of impostos) {
    if (i.status === 'pago') continue
    const venc = dateFromISO(i.vencimento)
    if (venc > latestKnown) latestKnown = venc
  }

  // Prazo de metas em andamento
  for (const m of metas) {
    if (m.status !== 'em_andamento') continue
    const prazo = dateFromISO(m.prazo)
    if (prazo > latestKnown) latestKnown = prazo
  }

  // Horizonte = últimoLançamento + 6 meses
  const horizonte = new Date(latestKnown)
  horizonte.setMonth(horizonte.getMonth() + 6)

  // Mínimo: hoje + 6 meses
  const minH = new Date(hoje)
  minH.setMonth(minH.getMonth() + 6)

  return horizonte > minH ? horizonte : minH
}

// ─── Engine Principal ────────────────────────────────────────────────────────

export function calcularProjecao(input: ProjecaoInput): ProjecaoResult {
  const {
    saldoAtual,
    diaRecebimento,
    rendaLiquida,
    dividas,
    cartoes,
    impostos,
    metas,
    gastosVariaveis,
  } = input

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const hojeISO = toISO(hoje)
  const hojeMs = hoje.getTime()

  // Horizonte de projeção
  const dataFim = calcularHorizonteFim(hoje, dividas, impostos, metas)
  const dataFimISO = toISO(dataFim)

  // ── Média diária de gasto variável (últimos 90 dias) ──────────────────────
  const totalGastos90 = gastosVariaveis
    .filter(g => g.tipo === 'gasto')
    .reduce((s, g) => s + g.valor, 0)
  // Divide por 90 para obter média de gasto em qualquer dia
  const mediaDiariaGasto = totalGastos90 / 90

  // ── Mapa de eventos: date → EventoProjecao[] ──────────────────────────────
  const eventMap = new Map<string, EventoProjecao[]>()

  function addEvento(dataISO: string, evento: EventoProjecao) {
    if (dataISO <= hojeISO) return  // eventos passados ignorados
    const d = dateFromISO(dataISO)
    if (d > dataFim) return          // fora do horizonte ignorado
    if (!eventMap.has(dataISO)) eventMap.set(dataISO, [])
    eventMap.get(dataISO)!.push(evento)
  }

  // 1. Salário — diaRecebimento de cada mês dentro do horizonte
  if (rendaLiquida > 0) {
    let mesOffset = 0
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const dataVenc = new Date(
        hoje.getFullYear(),
        hoje.getMonth() + mesOffset,
        diaRecebimento,
      )
      if (dataVenc > dataFim) break
      addEvento(toISO(dataVenc), {
        descricao: 'Salário / Renda mensal',
        valor: rendaLiquida,
        categoria: 'salario',
      })
      mesOffset++
    }
  }

  // 2. Parcelas de dívidas ativas
  for (const divida of dividas) {
    if (divida.status === 'quitado') continue
    const parcRestantes = divida.parcelasTotais - divida.parcelasPagas
    if (parcRestantes <= 0) continue

    let contadas = 0
    let mesOffset = 0

    while (contadas < parcRestantes) {
      const dataVenc = new Date(
        hoje.getFullYear(),
        hoje.getMonth() + mesOffset,
        divida.vencimentoDia,
      )
      const dataISO = toISO(dataVenc)
      if (dataVenc > dataFim) break

      if (dataISO > hojeISO) {
        addEvento(dataISO, {
          descricao: `${divida.nome} (${divida.parcelasPagas + contadas + 1}/${divida.parcelasTotais})`,
          valor: -divida.valorParcela,
          categoria: 'divida',
          referencia: divida.nome,
        })
        contadas++
      }
      mesOffset++
    }
  }

  // 3. Faturas de cartão (apenas fatura atual, próximo vencimento)
  for (const cartao of cartoes) {
    if (cartao.faturaAtual <= 0) continue
    let dataVenc = new Date(hoje.getFullYear(), hoje.getMonth(), cartao.diaVencimento)
    if (toISO(dataVenc) <= hojeISO) {
      dataVenc = new Date(hoje.getFullYear(), hoje.getMonth() + 1, cartao.diaVencimento)
    }
    addEvento(toISO(dataVenc), {
      descricao: `Fatura ${cartao.nome}`,
      valor: -cartao.faturaAtual,
      categoria: 'cartao',
      referencia: cartao.nome,
    })
  }

  // 4. Impostos com data de vencimento futura
  for (const imposto of impostos) {
    if (imposto.status === 'pago') continue
    addEvento(imposto.vencimento, {
      descricao: imposto.descricao,
      valor: -imposto.valor,
      categoria: 'imposto',
      referencia: imposto.tipo,
    })
  }

  // 5. Aportes mensais em metas em andamento (dia 5 de cada mês)
  for (const meta of metas) {
    if (meta.status !== 'em_andamento') continue
    const valorRestante = meta.valorAlvo - meta.valorAcumulado
    if (valorRestante <= 0) continue
    const prazo = dateFromISO(meta.prazo)
    const mesesRestantes = Math.max(
      1,
      (prazo.getFullYear() - hoje.getFullYear()) * 12 + prazo.getMonth() - hoje.getMonth(),
    )
    const aporteMensal = valorRestante / mesesRestantes

    for (let m = 1; m <= mesesRestantes; m++) {
      const dataAporte = new Date(hoje.getFullYear(), hoje.getMonth() + m, 5)
      if (dataAporte > dataFim) break
      addEvento(toISO(dataAporte), {
        descricao: `Aporte: ${meta.nome}`,
        valor: -aporteMensal,
        categoria: 'meta',
        referencia: meta.nome,
      })
    }
  }

  // ── Iteração dia a dia ────────────────────────────────────────────────────
  const diasProjecao: DiaProjecao[] = []
  const balanceMap = new Map<string, number>()
  let saldoCorrente = saldoAtual

  let cursor = addDays(hoje, 1)
  while (toISO(cursor) <= dataFimISO) {
    const dataISO = toISO(cursor)
    const eventos = eventMap.get(dataISO) ?? []

    const entradasNomeadas = eventos.filter(e => e.valor > 0).reduce((s, e) => s + e.valor, 0)
    const saidasNomeadas = eventos.filter(e => e.valor < 0).reduce((s, e) => s + Math.abs(e.valor), 0)

    // Gasto estimado aplicado diariamente (silencioso — não entra em eventos)
    const totalEntradas = entradasNomeadas
    const totalSaidas = saidasNomeadas + mediaDiariaGasto

    saldoCorrente += totalEntradas - totalSaidas

    diasProjecao.push({
      data: dataISO,
      saldoFim: Math.round(saldoCorrente * 100) / 100,
      entradas: totalEntradas,
      saidas: totalSaidas,
      eventos,
    })

    balanceMap.set(dataISO, saldoCorrente)
    cursor = addDays(cursor, 1)
  }

  // ── Resumo mensal ─────────────────────────────────────────────────────────
  const mesesMap = new Map<string, {
    entradas: number
    saidas: number
    totalDividas: number
    ultimoSaldo: number
    temNegativo: boolean
  }>()

  for (const dia of diasProjecao) {
    const mes = dia.data.slice(0, 7)
    if (!mesesMap.has(mes)) {
      mesesMap.set(mes, { entradas: 0, saidas: 0, totalDividas: 0, ultimoSaldo: dia.saldoFim, temNegativo: false })
    }
    const entry = mesesMap.get(mes)!
    entry.entradas += dia.entradas
    entry.saidas += dia.saidas
    entry.ultimoSaldo = dia.saldoFim
    if (dia.saldoFim < 0) entry.temNegativo = true
    for (const ev of dia.eventos) {
      if (ev.categoria === 'divida') entry.totalDividas += Math.abs(ev.valor)
    }
  }

  const mesesProjecao: MesProjecao[] = [...mesesMap.entries()].map(([mesAno, v]) => ({
    mesAno,
    label: labelMes(mesAno),
    entradas: Math.round(v.entradas * 100) / 100,
    saidas: Math.round(v.saidas * 100) / 100,
    liquido: Math.round((v.entradas - v.saidas) * 100) / 100,
    saldoFimMes: Math.round(v.ultimoSaldo * 100) / 100,
    totalDividas: Math.round(v.totalDividas * 100) / 100,
    temSaldoNegativo: v.temNegativo,
  }))

  // ── KPIs ──────────────────────────────────────────────────────────────────
  let menorSaldo = saldoAtual
  let dataMenorSaldo = hojeISO
  const mesesNegativos: string[] = []
  let totalDividasHorizonte = 0
  let proximoSalarioData = ''
  const proximoSalarioValor = rendaLiquida
  let diasAteQuitarTudo: number | null = null

  for (const dia of diasProjecao) {
    if (dia.saldoFim < menorSaldo) {
      menorSaldo = dia.saldoFim
      dataMenorSaldo = dia.data
    }
    for (const ev of dia.eventos) {
      if (ev.categoria === 'divida') totalDividasHorizonte += Math.abs(ev.valor)
      if (ev.categoria === 'salario' && !proximoSalarioData) proximoSalarioData = dia.data
    }
  }

  for (const mes of mesesProjecao) {
    if (mes.temSaldoNegativo && !mesesNegativos.includes(mes.mesAno)) {
      mesesNegativos.push(mes.mesAno)
    }
  }

  // Dia em que todas as dívidas estarão quitadas (dentro do horizonte)
  const todasQuitadas = diasProjecao.find(
    d => d.eventos.length === 0 || d.eventos.every(e => e.categoria !== 'divida'),
  )
  if (todasQuitadas && dividas.filter(d => d.status !== 'quitado').length > 0) {
    const diff = Math.ceil(
      (dateFromISO(todasQuitadas.data).getTime() - hojeMs) / (1000 * 60 * 60 * 24),
    )
    diasAteQuitarTudo = diff
  }

  const ultimoDia = diasProjecao[diasProjecao.length - 1]
  const saldoFinalHorizonte = ultimoDia?.saldoFim ?? saldoAtual
  const dataFinalHorizonte = ultimoDia?.data ?? dataFimISO

  // ── Snapshot 30 / 60 / 90 ────────────────────────────────────────────────
  const snapshot30 = balanceMap.get(toISO(addDays(hoje, 30))) ?? saldoFinalHorizonte
  const snapshot60 = balanceMap.get(toISO(addDays(hoje, 60))) ?? saldoFinalHorizonte
  const snapshot90 = balanceMap.get(toISO(addDays(hoje, 90))) ?? saldoFinalHorizonte

  // ── Dados para gráfico de linha (amostrado a cada 7 dias) ─────────────────
  const dadosGraficoLinha = diasProjecao
    .filter((_, i) => i % 7 === 6 || i === diasProjecao.length - 1)
    .map(d => ({
      data: d.data,
      label: dateFromISO(d.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      saldo: d.saldoFim,
    }))

  // ── getBalanceAt ──────────────────────────────────────────────────────────
  function getBalanceAt(data: string): number {
    if (data <= hojeISO) return saldoAtual
    const found = balanceMap.get(data)
    if (found !== undefined) return found
    // Interpola: retorna o saldo do dia mais próximo disponível
    if (data > dataFimISO) return saldoFinalHorizonte
    // Busca o dia anterior mais próximo
    const d = dateFromISO(data)
    for (let i = 1; i <= 7; i++) {
      const prev = toISO(addDays(d, -i))
      if (balanceMap.has(prev)) return balanceMap.get(prev)!
    }
    return saldoAtual
  }

  return {
    horizonte: { inicio: hojeISO, fim: dataFimISO },
    diasProjecao,
    mesesProjecao,
    kpis: {
      saldoFinalHorizonte,
      dataFinalHorizonte,
      menorSaldo,
      dataMenorSaldo,
      mesesNegativos,
      totalDividasHorizonte,
      proximoSalarioData,
      proximoSalarioValor,
      diasAteQuitarTudo,
    },
    getBalanceAt,
    snapshot30,
    snapshot60,
    snapshot90,
    dadosGraficoLinha,
  }
}
