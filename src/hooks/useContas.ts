import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import type { Conta } from '../db/types'

export function useContas() {
  const contas = useLiveQuery(() => db.contas.toArray(), []) ?? []
  const contasAtivas = contas.filter((c: Conta) => c.ativa)

  async function adicionarConta(conta: Omit<Conta, 'id'>): Promise<number> {
    return db.contas.add(conta) as Promise<number>
  }

  async function atualizarConta(id: number, changes: Partial<Conta>): Promise<void> {
    await db.contas.update(id, changes)
  }

  async function arquivarConta(id: number): Promise<void> {
    await db.contas.update(id, { ativa: false })
  }

  return { contas, contasAtivas, adicionarConta, atualizarConta, arquivarConta }
}
