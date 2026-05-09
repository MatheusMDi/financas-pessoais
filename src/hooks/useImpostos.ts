import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import type { Imposto } from '../db/types'

export function useImpostos() {
  const impostos = useLiveQuery(() => db.impostos.toArray(), []) ?? []

  async function adicionarImposto(imposto: Omit<Imposto, 'id'>): Promise<void> {
    await db.impostos.add(imposto)
  }

  async function atualizarImposto(id: number, changes: Partial<Imposto>): Promise<void> {
    await db.impostos.update(id, changes)
  }

  async function removerImposto(id: number): Promise<void> {
    await db.impostos.delete(id)
  }

  const totalAPagar = impostos
    .filter((i: Imposto) => i.status === 'a_pagar' || i.status === 'atrasado')
    .reduce((acc: number, i: Imposto) => acc + i.valor, 0)

  const totalProvisionado = impostos
    .filter((i: Imposto) => i.status === 'provisionado')
    .reduce((acc: number, i: Imposto) => acc + i.provisionado, 0)

  return { impostos, adicionarImposto, atualizarImposto, removerImposto, totalAPagar, totalProvisionado }
}
