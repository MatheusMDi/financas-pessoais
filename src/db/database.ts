import Dexie, { type EntityTable } from 'dexie'
import type {
  Divida, Cartao, Imposto,
  GastoFuturo, Meta, RendaMensal, Configuracao
} from './types'

class MDFinancasDB extends Dexie {
  dividas!: EntityTable<Divida, 'id'>
  cartoes!: EntityTable<Cartao, 'id'>
  impostos!: EntityTable<Imposto, 'id'>
  gastosFuturos!: EntityTable<GastoFuturo, 'id'>
  metas!: EntityTable<Meta, 'id'>
  rendaMensal!: EntityTable<RendaMensal, 'id'>
  configuracoes!: EntityTable<Configuracao, 'id'>

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
  }
}

export const db = new MDFinancasDB()
