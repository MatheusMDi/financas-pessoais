import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { db } from '../db/database'
import { diasUteisRestantesNoMes } from '../utils/formatDate'

export interface SaldoDia {
  saldoDisponivel: number
  gastoHoje: number
  mediaGastoDiario: number
  diasUteisRestantes: number
  saldoPorDia: number
  alertaAtivo: boolean
  projecaoFimMes: number
}

export function useSaldoDia(): SaldoDia {
  const hoje = new Date().toISOString().slice(0, 10)
  const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const configuracoes = useLiveQuery(() => db.configuracoes.toArray(), []) ?? []
  const gastosHoje = useLiveQuery(() =>
    db.gastosVariaveis.where('data').equals(hoje).toArray()
  , [hoje]) ?? []
  const gastosRecentes = useLiveQuery(() =>
    db.gastosVariaveis.where('data').between(trintaDiasAtras, hoje, true, true).toArray()
  , [trintaDiasAtras, hoje]) ?? []

  return useMemo(() => {
    const saldoConfig = configuracoes.find(c => c.chave === 'saldoAtual')
    const saldoDisponivel = saldoConfig ? parseFloat(saldoConfig.valor) || 0 : 0

    const gastoHoje = gastosHoje
      .filter(g => g.tipo === 'gasto')
      .reduce((acc, g) => acc + g.valor, 0)

    const diasComGasto = new Set(
      gastosRecentes.filter(g => g.tipo === 'gasto').map(g => g.data)
    ).size
    const totalRecente = gastosRecentes
      .filter(g => g.tipo === 'gasto')
      .reduce((acc, g) => acc + g.valor, 0)
    const mediaGastoDiario = diasComGasto > 0 ? totalRecente / diasComGasto : 0

    const diasUteisRestantes = Math.max(1, diasUteisRestantesNoMes())
    const saldoPorDia = saldoDisponivel / diasUteisRestantes
    const alertaAtivo = saldoPorDia > 0 && gastoHoje > saldoPorDia * 1.5
    const projecaoFimMes = saldoDisponivel - mediaGastoDiario * diasUteisRestantes

    return {
      saldoDisponivel,
      gastoHoje,
      mediaGastoDiario,
      diasUteisRestantes,
      saldoPorDia,
      alertaAtivo,
      projecaoFimMes,
    }
  }, [configuracoes, gastosHoje, gastosRecentes])
}
