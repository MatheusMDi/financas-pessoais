import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { db } from '../db/database'
import { calcularProjecao, type ProjecaoResult } from '../services/projectionService'

/**
 * Hook reativo — recalcula a projeção toda vez que qualquer dado
 * financeiro é salvo no IndexedDB (lançamentos, dívidas, etc.).
 */
export function useProjection(): ProjecaoResult | null {
  const configuracoes = useLiveQuery(() => db.configuracoes.toArray(), []) ?? []
  const dividas = useLiveQuery(() => db.dividas.toArray(), []) ?? []
  const cartoes = useLiveQuery(() => db.cartoes.toArray(), []) ?? []
  const impostos = useLiveQuery(() => db.impostos.toArray(), []) ?? []
  const metas = useLiveQuery(() => db.metas.toArray(), []) ?? []
  const rendaMensal = useLiveQuery(
    () => db.rendaMensal.orderBy('mesAno').reverse().toArray(),
    [],
  ) ?? []

  // Últimos 90 dias de gastos variáveis para calcular média diária
  const noventa = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 90)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dd}`
  }, [])
  const hojeISO = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const gastosVariaveis = useLiveQuery(
    () => db.gastosVariaveis.where('data').between(noventa, hojeISO, true, true).toArray(),
    [noventa, hojeISO],
  ) ?? []

  return useMemo(() => {
    // Aguarda o IndexedDB carregar todos os dados antes de calcular
    if (
      configuracoes === undefined ||
      dividas === undefined ||
      rendaMensal === undefined
    ) return null

    const getConf = (chave: string, padrao = '0') =>
      configuracoes.find(c => c.chave === chave)?.valor ?? padrao

    const saldoAtual = parseFloat(getConf('saldoAtual')) || 0
    const diaRecebimento = parseInt(getConf('diaRecebimento', '5')) || 5

    // Renda: prefere último registro de rendaMensal, fallback para config
    const ultimaRenda = rendaMensal[0]
    const rendaLiquida =
      ultimaRenda?.totalLiquido ||
      parseFloat(getConf('rendaMensal')) ||
      0

    return calcularProjecao({
      saldoAtual,
      diaRecebimento,
      rendaLiquida,
      dividas,
      cartoes,
      impostos,
      metas,
      gastosVariaveis,
    })
  }, [configuracoes, dividas, cartoes, impostos, metas, rendaMensal, gastosVariaveis])
}
