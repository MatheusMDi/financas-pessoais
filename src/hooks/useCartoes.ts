import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import type { Cartao } from '../db/types'

export function useCartoes() {
  const cartoes = useLiveQuery(() => db.cartoes.toArray(), []) ?? []

  async function adicionarCartao(cartao: Omit<Cartao, 'id'>): Promise<void> {
    await db.cartoes.add(cartao)
  }

  async function atualizarCartao(id: number, changes: Partial<Cartao>): Promise<void> {
    await db.cartoes.update(id, changes)
  }

  async function removerCartao(id: number): Promise<void> {
    await db.cartoes.delete(id)
  }

  const totalFaturas = cartoes.reduce((acc: number, c: Cartao) => acc + c.faturaAtual, 0)
  const totalLimite = cartoes.reduce((acc: number, c: Cartao) => acc + c.limiteTotal, 0)
  const totalDisponivel = cartoes.reduce((acc: number, c: Cartao) => acc + c.limiteDisponivel, 0)

  return { cartoes, adicionarCartao, atualizarCartao, removerCartao, totalFaturas, totalLimite, totalDisponivel }
}
