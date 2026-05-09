import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import { seedInitialData, seedCategorias, seedContas } from './db/seed'
import { db } from './db/database'

async function init() {
  try {
    await db.open()
    const count = await db.rendaMensal.count()
    if (count === 0) {
      await seedInitialData()
    } else {
      // Seed new tables for existing installs
      await seedCategorias()
      await seedContas()
    }
  } catch (err) {
    console.error('[MDFin] Erro ao inicializar banco de dados:', err)
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void init()
