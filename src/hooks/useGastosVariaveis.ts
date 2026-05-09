import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import type { GastoVariavel } from '../db/types'

export function useGastosVariaveis(filtroData?: { de: string; ate: string }) {
  const gastosVariaveis = useLiveQuery(() => {
    if (filtroData) {
      return db.gastosVariaveis
        .where('data')
        .between(filtroData.de, filtroData.ate, true, true)
        .toArray()
    }
    return db.gastosVariaveis.orderBy('data').reverse().toArray()
  }, [filtroData?.de, filtroData?.ate]) ?? []

  async function adicionarGasto(gasto: Omit<GastoVariavel, 'id'>): Promise<number> {
    return db.gastosVariaveis.add(gasto) as Promise<number>
  }

  async function atualizarGasto(id: number, changes: Partial<GastoVariavel>): Promise<void> {
    await db.gastosVariaveis.update(id, changes)
  }

  async function removerGasto(id: number): Promise<void> {
    await db.gastosVariaveis.delete(id)
  }

  const gastoHoje = (() => {
    const hoje = new Date().toISOString().slice(0, 10)
    return gastosVariaveis
      .filter(g => g.data === hoje && g.tipo === 'gasto')
      .reduce((acc: number, g: GastoVariavel) => acc + g.valor, 0)
  })()

  const totalPeriodo = gastosVariaveis
    .filter(g => g.tipo === 'gasto')
    .reduce((acc: number, g: GastoVariavel) => acc + g.valor, 0)

  return { gastosVariaveis, adicionarGasto, atualizarGasto, removerGasto, gastoHoje, totalPeriodo }
}
