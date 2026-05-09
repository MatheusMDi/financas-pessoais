import Dexie, { type EntityTable } from 'dexie'
import type {
  Divida, Cartao, Imposto,
  GastoFuturo, Meta, RendaMensal, Configuracao,
  GastoVariavel, Categoria, Subcategoria, Conta, FaturaCartao
} from './types'

class MDFinancasDB extends Dexie {
  dividas!: EntityTable<Divida, 'id'>
  cartoes!: EntityTable<Cartao, 'id'>
  impostos!: EntityTable<Imposto, 'id'>
  gastosFuturos!: EntityTable<GastoFuturo, 'id'>
  metas!: EntityTable<Meta, 'id'>
  rendaMensal!: EntityTable<RendaMensal, 'id'>
  configuracoes!: EntityTable<Configuracao, 'id'>
  gastosVariaveis!: EntityTable<GastoVariavel, 'id'>
  categorias!: EntityTable<Categoria, 'id'>
  subcategorias!: EntityTable<Subcategoria, 'id'>
  contas!: EntityTable<Conta, 'id'>
  faturas!: EntityTable<FaturaCartao, 'id'>

  constructor() {
    super('md-financas')
    this.version(1).stores({
      dividas:       '++id, status, origem, vencimentoDia',
      cartoes:       '++id, banco, status',
      impostos:      '++id, tipo, status, vencimento',
      gastosFuturos: '++id, categoria, status, prioridade',
      metas:         '++id, tipo, status',
      rendaMensal:   '++id, mesAno',
      configuracoes: '++id, chave',
    })
    this.version(2).stores({
      dividas:         '++id, status, origem, vencimentoDia',
      cartoes:         '++id, banco, status',
      impostos:        '++id, tipo, status, vencimento',
      gastosFuturos:   '++id, categoria, status, prioridade',
      metas:           '++id, tipo, status',
      rendaMensal:     '++id, mesAno',
      configuracoes:   '++id, chave',
      gastosVariaveis: '++id, categoriaId, subcategoriaId, contaId, data',
      categorias:      '++id, nome, tipo',
      subcategorias:   '++id, categoriaId, nome',
      contas:          '++id, nome, tipo',
      faturas:         '++id, cartaoId, mesAno, status',
    })
    // v3: adiciona índice "ordem" em categorias e corrige gastosVariaveis.data
    this.version(3).stores({
      dividas:         '++id, status, origem, vencimentoDia',
      cartoes:         '++id, banco, status',
      impostos:        '++id, tipo, status, vencimento',
      gastosFuturos:   '++id, categoria, status, prioridade',
      metas:           '++id, tipo, status',
      rendaMensal:     '++id, mesAno',
      configuracoes:   '++id, chave',
      gastosVariaveis: '++id, categoriaId, subcategoriaId, contaId, data',
      categorias:      '++id, nome, tipo, ordem',
      subcategorias:   '++id, categoriaId, nome',
      contas:          '++id, nome, tipo',
      faturas:         '++id, cartaoId, mesAno, status',
    })
  }
}

export const db = new MDFinancasDB()
