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
  const seen = new Map<string, number>() // normalized name → canonical id

  for (const cat of all) {
    const key = normalize(cat.nome)
    if (!seen.has(key)) {
      seen.set(key, cat.id!)
      continue
    }
    // This is a duplicate — remap references then delete
    const canonicalId = seen.get(key)!
    const dupeId = cat.id!

    await db.transaction('rw', [db.gastosVariaveis, db.categorias], async () => {
      await db.gastosVariaveis
        .where('categoriaId')
        .equals(dupeId)
        .modify({ categoriaId: canonicalId })
      await db.categorias.delete(dupeId)
    })
  }
}
