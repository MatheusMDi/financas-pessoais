import { create } from 'zustand'
import { db } from '../db/database'

type Tema = 'dark' | 'light'

export type AccentKey = 'yellow' | 'blue' | 'green' | 'purple' | 'orange'

export const ACCENT_CORES: Record<AccentKey, { nome: string; dark: string; light: string; onAccent: string }> = {
  yellow: { nome: 'Ouro',    dark: '#fcd535', light: '#b8860b', onAccent: '#181a20' },
  blue:   { nome: 'Azul',    dark: '#4d9fff', light: '#1a5fa8', onAccent: '#ffffff' },
  green:  { nome: 'Verde',   dark: '#0ecb81', light: '#0a9a62', onAccent: '#181a20' },
  purple: { nome: 'Roxo',    dark: '#b088ff', light: '#6a3db8', onAccent: '#ffffff' },
  orange: { nome: 'Laranja', dark: '#f0a500', light: '#c06020', onAccent: '#181a20' },
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
  accent: 'yellow',

  carregarTema: async () => {
    const [temaRow, accentRow] = await Promise.all([
      db.configuracoes.where('chave').equals('tema').first(),
      db.configuracoes.where('chave').equals('corSecundaria').first(),
    ])
    const tema = (temaRow?.valor as Tema) ?? 'dark'
    const accent = (accentRow?.valor as AccentKey) ?? 'yellow'
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
  const info = ACCENT_CORES[key]
  const cor = tema === 'dark' ? info.dark : info.light
  document.documentElement.style.setProperty('--blue', cor)
  document.documentElement.style.setProperty('--on-accent', info.onAccent)
}
