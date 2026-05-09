import { db } from '../db/database'
import type { Divida, StatusDivida, OrigemFinanceira } from '../db/types'

export async function exportBackup(): Promise<void> {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    dividas: await db.dividas.toArray(),
    cartoes: await db.cartoes.toArray(),
    impostos: await db.impostos.toArray(),
    gastosFuturos: await db.gastosFuturos.toArray(),
    metas: await db.metas.toArray(),
    rendaMensal: await db.rendaMensal.toArray(),
    configuracoes: await db.configuracoes.toArray(),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `md-financas-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export interface BackupData {
  version: number
  exportedAt: string
  dividas: Divida[]
  cartoes: unknown[]
  impostos: unknown[]
  gastosFuturos: unknown[]
  metas: unknown[]
  rendaMensal: unknown[]
  configuracoes?: unknown[]
}

export interface BackupSummary {
  dividas: number
  cartoes: number
  impostos: number
  gastosFuturos: number
  metas: number
  rendaMensal: number
}

export function validateBackup(raw: unknown): { valid: true; data: BackupData; summary: BackupSummary } | { valid: false; error: string } {
  if (typeof raw !== 'object' || raw === null) {
    return { valid: false, error: 'Arquivo inválido: não é um objeto JSON' }
  }
  const obj = raw as Record<string, unknown>
  if (!obj.version || !obj.exportedAt) {
    return { valid: false, error: 'Arquivo inválido: faltam campos obrigatórios (version, exportedAt)' }
  }
  const requiredKeys = ['dividas', 'cartoes', 'impostos', 'gastosFuturos', 'metas', 'rendaMensal']
  for (const key of requiredKeys) {
    if (!Array.isArray(obj[key])) {
      return { valid: false, error: `Arquivo inválido: campo "${key}" deve ser um array` }
    }
  }
  const data = raw as BackupData
  return {
    valid: true,
    data,
    summary: {
      dividas: data.dividas.length,
      cartoes: (data.cartoes as unknown[]).length,
      impostos: (data.impostos as unknown[]).length,
      gastosFuturos: (data.gastosFuturos as unknown[]).length,
      metas: (data.metas as unknown[]).length,
      rendaMensal: (data.rendaMensal as unknown[]).length,
    },
  }
}

export async function importBackup(data: BackupData): Promise<void> {
  await db.transaction('rw',
    [db.dividas, db.cartoes, db.impostos, db.gastosFuturos, db.metas, db.rendaMensal, db.configuracoes],
    async () => {
      await db.dividas.clear()
      await db.cartoes.clear()
      await db.impostos.clear()
      await db.gastosFuturos.clear()
      await db.metas.clear()
      await db.rendaMensal.clear()
      if (data.configuracoes) await db.configuracoes.clear()

      const stripId = <T extends { id?: number }>(items: T[]): Omit<T, 'id'>[] =>
        items.map(({ id: _id, ...rest }) => rest as Omit<T, 'id'>)

      if (data.dividas.length > 0) await db.dividas.bulkAdd(stripId(data.dividas) as Divida[])
      if ((data.cartoes as unknown[]).length > 0) await db.cartoes.bulkAdd(stripId(data.cartoes as { id?: number }[]) as never[])
      if ((data.impostos as unknown[]).length > 0) await db.impostos.bulkAdd(stripId(data.impostos as { id?: number }[]) as never[])
      if ((data.gastosFuturos as unknown[]).length > 0) await db.gastosFuturos.bulkAdd(stripId(data.gastosFuturos as { id?: number }[]) as never[])
      if ((data.metas as unknown[]).length > 0) await db.metas.bulkAdd(stripId(data.metas as { id?: number }[]) as never[])
      if ((data.rendaMensal as unknown[]).length > 0) await db.rendaMensal.bulkAdd(stripId(data.rendaMensal as { id?: number }[]) as never[])
      if (data.configuracoes && (data.configuracoes as unknown[]).length > 0) {
        await db.configuracoes.bulkAdd(stripId(data.configuracoes as { id?: number }[]) as never[])
      }
    }
  )
}

const STATUS_DIVIDA_VALID: StatusDivida[] = ['em_aberto', 'atencao', 'quitado']
const ORIGEM_VALID: OrigemFinanceira[] = ['PF', 'PJ']

export function parseCSVDividas(csv: string): { rows: Divida[]; errors: string[] } {
  const lines = csv.trim().split('\n')
  if (lines.length < 2) return { rows: [], errors: ['CSV vazio ou sem dados'] }

  const errors: string[] = []
  const rows: Divida[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
    const [nome, valorParcela, parcelasTotais, parcelasPagas, vencimentoDia, status, origem] = cols

    if (!nome) { errors.push(`Linha ${i + 1}: nome obrigatório`); continue }

    const vp = parseFloat(valorParcela)
    const pt = parseInt(parcelasTotais)
    const pp = parseInt(parcelasPagas)
    const vd = parseInt(vencimentoDia)

    if (isNaN(vp) || isNaN(pt) || isNaN(pp) || isNaN(vd)) {
      errors.push(`Linha ${i + 1}: valores numéricos inválidos`)
      continue
    }

    const statusVal = (status || 'em_aberto') as StatusDivida
    if (!STATUS_DIVIDA_VALID.includes(statusVal)) {
      errors.push(`Linha ${i + 1}: status inválido "${status}"`)
      continue
    }

    const origemVal = (origem || 'PF') as OrigemFinanceira
    if (!ORIGEM_VALID.includes(origemVal)) {
      errors.push(`Linha ${i + 1}: origem inválida "${origem}"`)
      continue
    }

    rows.push({
      nome,
      tipo: 'parcela_fixa',
      origem: origemVal,
      valorTotal: vp * (pt - pp),
      valorParcela: vp,
      parcelasTotais: pt,
      parcelasPagas: pp,
      vencimentoDia: vd,
      status: statusVal,
      criadoEm: new Date().toISOString(),
    })
  }

  return { rows, errors }
}

export async function importCSVDividas(rows: Divida[]): Promise<void> {
  const toInsert = rows.map(({ id: _id, ...rest }) => rest as Divida)
  await db.dividas.bulkAdd(toInsert)
}
