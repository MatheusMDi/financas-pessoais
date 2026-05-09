import { create } from 'zustand'
import { db } from '../db/database'

type Tema = 'dark' | 'light'

interface ThemeState {
  tema: Tema
  setTema: (tema: Tema) => Promise<void>
  toggleTema: () => Promise<void>
  carregarTema: () => Promise<void>
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  tema: 'dark',

  carregarTema: async () => {
    const cfg = await db.configuracoes.where('chave').equals('tema').first()
    const tema = (cfg?.valor as Tema) ?? 'dark'
    set({ tema })
    aplicarTema(tema)
  },

  setTema: async (tema: Tema) => {
    set({ tema })
    aplicarTema(tema)
    const existing = await db.configuracoes.where('chave').equals('tema').first()
    if (existing?.id !== undefined) {
      await db.configuracoes.update(existing.id, { valor: tema })
    } else {
      await db.configuracoes.add({ chave: 'tema', valor: tema })
    }
  },

  toggleTema: async () => {
    const novoTema = get().tema === 'dark' ? 'light' : 'dark'
    await get().setTema(novoTema)
  },
}))

function aplicarTema(tema: Tema): void {
  if (tema === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}
