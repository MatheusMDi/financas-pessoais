import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { db } from '../db/database'
import { calcularFluxo, type EventoFluxo } from '../utils/calcFluxo'

export function useFluxo(mesesAFrente = 3): { eventos: EventoFluxo[]; saldoAtual: number } {
  const dividas = useLiveQuery(() => db.dividas.toArray(), []) ?? []
  const cartoes = useLiveQuery(() => db.cartoes.toArray(), []) ?? []
  const impostos = useLiveQuery(() => db.impostos.toArray(), []) ?? []
  const metas = useLiveQuery(() => db.metas.toArray(), []) ?? []
  const rendaMensal = useLiveQuery(() => db.rendaMensal.toArray(), []) ?? []
  const configuracoes = useLiveQuery(() => db.configuracoes.toArray(), []) ?? []

  const saldoAtual = useMemo(() => {
    const cfg = configuracoes.find((c: { chave: string }) => c.chave === 'saldoAtual')
    return cfg ? parseFloat(cfg.valor) || 0 : 0
  }, [configuracoes])

  const eventos = useMemo(() => {
    return calcularFluxo({ saldoAtual, dividas, cartoes, impostos, metas, rendaMensal, mesesAFrente })
  }, [saldoAtual, dividas, cartoes, impostos, metas, rendaMensal, mesesAFrente])

  return { eventos, saldoAtual }
}
