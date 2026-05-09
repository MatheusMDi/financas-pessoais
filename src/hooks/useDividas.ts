import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import type { Divida } from '../db/types'

export function useDividas() {
  const dividas = useLiveQuery(() => db.dividas.toArray(), []) ?? []

  async function adicionarDivida(divida: Omit<Divida, 'id'>): Promise<void> {
    await db.dividas.add(divida)
  }

  async function atualizarDivida(id: number, changes: Partial<Divida>): Promise<void> {
    await db.dividas.update(id, changes)
  }

  async function removerDivida(id: number): Promise<void> {
    await db.dividas.delete(id)
  }

  const totalComprometido = dividas
    .filter((d: Divida) => d.status !== 'quitado')
    .reduce((acc: number, d: Divida) => acc + d.valorParcela, 0)

  return { dividas, adicionarDivida, atualizarDivida, removerDivida, totalComprometido }
}
