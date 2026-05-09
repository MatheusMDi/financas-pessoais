import { create } from 'zustand'
import { db } from '../db/database'

type Tema = 'dark' | 'light'

export type AccentKey = 'blue' | 'green' | 'purple' | 'orange' | 'red'

export const ACCENT_CORES: Record<AccentKey, { nome: string; dark: string; light: string }> = {
  blue:   { nome: 'Azul',    dark: '#4d9fff', light: '#1a5fa8' },
  green:  { nome: 'Verde',   dark: '#00e5a0', light: '#00916a' },
  purple: { nome: 'Roxo',    dark: '#b088ff', light: '#6a3db8' },
  orange: { nome: 'Laranja', dark: '#ff9f4d', light: '#c06020' },
  red:    { nome: 'Vermelho',dark: '#ff4d6a', light: '#cc2244' },
}

interface ThemeState {
  tema: Tema
  accent: AccentKey
  setTema: (tema: Tema) => Promise<void>
  toggleTema: () => Promise<void>
  carregarTema: () => Promise<void>
  setAccent: (key: AccentKey) => Promise<void>
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  tema: 'dark',
  accent: 'blue',

  carregarTema: async () => {
    const [temaRow, accentRow] = await Promise.all([
      db.configuracoes.where('chave').equals('tema').first(),
      db.configuracoes.where('chave').equals('corSecundaria').first(),
    ])
    const tema = (temaRow?.valor as Tema) ?? 'dark'
    const accent = (accentRow?.valor as AccentKey) ?? 'blue'
    set({ tema, accent })
    aplicarTema(tema)
    aplicarAccent(accent, tema)
  },

  setTema: async (tema: Tema) => {
    set({ tema })
    aplicarTema(tema)
    aplicarAccent(get().accent, tema)
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

  setAccent: async (key: AccentKey) => {
    set({ accent: key })
    aplicarAccent(key, get().tema)
    const existing = await db.configuracoes.where('chave').equals('corSecundaria').first()
    if (existing?.id !== undefined) {
      await db.configuracoes.update(existing.id, { valor: key })
    } else {
      await db.configuracoes.add({ chave: 'corSecundaria', valor: key })
    }
  },
}))

function aplicarTema(tema: Tema): void {
  if (tema === 'dark') document.documentElement.classList.add('dark')
  else document.documentElement.classList.remove('dark')
}

function aplicarAccent(key: AccentKey, tema: Tema): void {
  const cor = tema === 'dark' ? ACCENT_CORES[key].dark : ACCENT_CORES[key].light
  document.documentElement.style.setProperty('--blue', cor)
}
