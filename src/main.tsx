import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { seedInitialData, seedCategorias, seedContas } from './db/seed'
import { db } from './db/database'
import { deduplicateCategories, deduplicateContas } from './utils/deduplicateCategories'

const DB_NAME = 'md-financas'

async function init() {
  try {
    await db.open()
  } catch (err) {
    const name = (err as { name?: string }).name ?? ''
    console.error('[MDFin] Erro ao abrir banco:', err)

    // Banco corrompido ou schema incompatível — apaga e recarrega
    if (name === 'SchemaError' || name === 'VersionError' || name === 'UpgradeError') {
      console.warn('[MDFin] Schema inválido detectado — recriando banco...')
      try {
        await db.close()
        await new Promise<void>((resolve, reject) => {
          const req = indexedDB.deleteDatabase(DB_NAME)
          req.onsuccess = () => resolve()
          req.onerror = () => reject(req.error)
          req.onblocked = () => resolve() // força mesmo bloqueado
        })
      } catch (deleteErr) {
        console.error('[MDFin] Falha ao deletar banco:', deleteErr)
      }
      window.location.reload()
      return
    }
  }

  try {
    const count = await db.rendaMensal.count()
    if (count === 0) {
      await seedInitialData()
    } else {
      await seedCategorias()
      await seedContas()
    }
    await deduplicateCategories()
    await deduplicateContas()
  } catch (err) {
    console.error('[MDFin] Erro no seed:', err)
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
}

void init()
