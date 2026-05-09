import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import type { Meta } from '../db/types'

export function useMetas() {
  const metas = useLiveQuery(() => db.metas.toArray(), []) ?? []

  async function adicionarMeta(meta: Omit<Meta, 'id'>): Promise<void> {
    await db.metas.add(meta)
  }

  async function atualizarMeta(id: number, changes: Partial<Meta>): Promise<void> {
    await db.metas.update(id, changes)
  }

  async function removerMeta(id: number): Promise<void> {
    await db.metas.delete(id)
  }

  async function registrarAporte(id: number, valor: number): Promise<void> {
    const meta = await db.metas.get(id)
    if (!meta) return
    const novoAcumulado = Math.min(meta.valorAcumulado + valor, meta.valorAlvo)
    const novoStatus = novoAcumulado >= meta.valorAlvo ? 'concluida' : meta.status
    await db.metas.update(id, { valorAcumulado: novoAcumulado, status: novoStatus })
  }

  return { metas, adicionarMeta, atualizarMeta, removerMeta, registrarAporte }
}
