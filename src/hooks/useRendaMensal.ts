import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import type { RendaMensal } from '../db/types'

export function useRendaMensal() {
  const rendaMensal = useLiveQuery(
    () => db.rendaMensal.orderBy('mesAno').reverse().toArray(),
    []
  ) ?? []

  const rendaAtual = rendaMensal[0] ?? null

  async function salvarRenda(renda: Omit<RendaMensal, 'id'>): Promise<void> {
    const existing = await db.rendaMensal.where('mesAno').equals(renda.mesAno).first()
    if (existing?.id !== undefined) {
      await db.rendaMensal.update(existing.id, renda)
    } else {
      await db.rendaMensal.add(renda)
    }
  }

  return { rendaMensal, rendaAtual, salvarRenda }
}
