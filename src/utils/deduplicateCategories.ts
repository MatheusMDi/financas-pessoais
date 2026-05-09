import { db } from '../db/database'

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

export async function deduplicateCategories(): Promise<void> {
  const all = await db.categorias.orderBy('id').toArray()
  const seen = new Map<string, number>()

  for (const cat of all) {
    const key = normalize(cat.nome)
    if (!seen.has(key)) {
      seen.set(key, cat.id!)
      continue
    }
    const canonicalId = seen.get(key)!
    const dupeId = cat.id!

    await db.transaction('rw', [db.gastosVariaveis, db.subcategorias, db.categorias], async () => {
      await db.gastosVariaveis.where('categoriaId').equals(dupeId).modify({ categoriaId: canonicalId })
      await db.subcategorias.where('categoriaId').equals(dupeId).modify({ categoriaId: canonicalId })
      await db.categorias.delete(dupeId)
    })
  }
}

export async function deduplicateContas(): Promise<void> {
  const all = await db.contas.orderBy('id').toArray()
  const seen = new Map<string, number>()

  for (const conta of all) {
    const key = normalize(conta.nome)
    if (!seen.has(key)) {
      seen.set(key, conta.id!)
      continue
    }
    const canonicalId = seen.get(key)!
    const dupeId = conta.id!

    await db.transaction('rw', [db.gastosVariaveis, db.contas], async () => {
      await db.gastosVariaveis.where('contaId').equals(dupeId).modify({ contaId: canonicalId })
      await db.contas.delete(dupeId)
    })
  }
}
