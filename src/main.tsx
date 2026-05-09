import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import { seedInitialData } from './db/seed'
import { db } from './db/database'

async function init() {
  const count = await db.rendaMensal.count()
  if (count === 0) {
    await seedInitialData()
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void init()
