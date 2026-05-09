import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { db } from '../db/database'
import type { Categoria, Subcategoria } from '../db/types'

export interface StatusOrcamento {
  categoriaId: number
  gastoMes: number
  orcamentoMensal: number
  percentualUsado: number
  status: 'ok' | 'atencao' | 'estourado' | 'sem_limite'
}

export function useCategorias(alertaOrcamentoPct = 80) {
  const categorias = useLiveQuery(() => db.categorias.orderBy('ordem').toArray(), []) ?? []
  const subcategorias = useLiveQuery(() => db.subcategorias.toArray(), []) ?? []

  const mesAtual = new Date().toISOString().slice(0, 7)
  const gastosDoMes = useLiveQuery(() =>
    db.gastosVariaveis
      .where('data')
      .between(`${mesAtual}-01`, `${mesAtual}-31`, true, true)
      .toArray()
  , [mesAtual]) ?? []

  const statusOrcamentos = useMemo((): StatusOrcamento[] => {
    return categorias.map(cat => {
      const gasto = gastosDoMes
        .filter(g => g.categoriaId === cat.id && g.tipo === 'gasto')
        .reduce((acc, g) => acc + g.valor, 0)
      const orcamento = cat.orcamentoMensal ?? 0
      const pct = orcamento > 0 ? (gasto / orcamento) * 100 : 0
      const status: StatusOrcamento['status'] =
        orcamento === 0 ? 'sem_limite'
          : pct >= 100 ? 'estourado'
          : pct >= alertaOrcamentoPct ? 'atencao'
          : 'ok'
      return {
        categoriaId: cat.id!,
        gastoMes: gasto,
        orcamentoMensal: orcamento,
        percentualUsado: pct,
        status,
      }
    })
  }, [categorias, gastosDoMes, alertaOrcamentoPct])

  async function adicionarCategoria(cat: Omit<Categoria, 'id'>): Promise<number> {
    return db.categorias.add(cat) as Promise<number>
  }

  async function atualizarCategoria(id: number, changes: Partial<Categoria>): Promise<void> {
    await db.categorias.update(id, changes)
  }

  async function removerCategoria(id: number): Promise<void> {
    const cat = await db.categorias.get(id)
    if (cat?.padrao) return
    await db.categorias.delete(id)
    await db.subcategorias.where('categoriaId').equals(id).delete()
  }

  async function adicionarSubcategoria(sub: Omit<Subcategoria, 'id'>): Promise<number> {
    return db.subcategorias.add(sub) as Promise<number>
  }

  async function removerSubcategoria(id: number): Promise<void> {
    await db.subcategorias.delete(id)
  }

  function subcategoriasParaCategoria(categoriaId: number): Subcategoria[] {
    return subcategorias.filter(s => s.categoriaId === categoriaId)
  }

  function statusDeCategoria(categoriaId: number): StatusOrcamento | undefined {
    return statusOrcamentos.find(s => s.categoriaId === categoriaId)
  }

  return {
    categorias,
    subcategorias,
    statusOrcamentos,
    adicionarCategoria,
    atualizarCategoria,
    removerCategoria,
    adicionarSubcategoria,
    removerSubcategoria,
    subcategoriasParaCategoria,
    statusDeCategoria,
  }
}
