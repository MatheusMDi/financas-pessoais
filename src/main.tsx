import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import { seedInitialData } from './db/seed'
import { db } from './db/database'

async function init() {
  try {
    await db.open()
    const count = await db.rendaMensal.count()
    if (count === 0) {
      await seedInitialData()
    }
  } catch (err) {
    console.error('[MDFin] Erro ao inicializar banco de dados:', err)
    // Continua renderizando mesmo sem o banco — o app tentará abrir o DB depois
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void init()
