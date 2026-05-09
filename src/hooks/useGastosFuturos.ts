import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import type { GastoFuturo } from '../db/types'

export function useGastosFuturos() {
  const gastosFuturos = useLiveQuery(() => db.gastosFuturos.toArray(), []) ?? []

  async function adicionarGasto(gasto: Omit<GastoFuturo, 'id'>): Promise<void> {
    await db.gastosFuturos.add(gasto)
  }

  async function atualizarGasto(id: number, changes: Partial<GastoFuturo>): Promise<void> {
    await db.gastosFuturos.update(id, changes)
  }

  async function removerGasto(id: number): Promise<void> {
    await db.gastosFuturos.delete(id)
  }

  return { gastosFuturos, adicionarGasto, atualizarGasto, removerGasto }
}
