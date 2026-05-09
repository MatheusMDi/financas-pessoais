import { create } from 'zustand'

export interface Toast {
  id: string
  mensagem: string
  tipo: 'success' | 'warning' | 'error'
  duracao?: number
}

interface ToastState {
  toasts: Toast[]
  mostrar: (mensagem: string, tipo?: Toast['tipo'], duracao?: number) => void
  remover: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  mostrar: (mensagem, tipo = 'success', duracao = 3000) => {
    const id = Math.random().toString(36).slice(2)
    set(state => ({ toasts: [...state.toasts, { id, mensagem, tipo, duracao }] }))
    setTimeout(() => {
      set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }))
    }, duracao)
  },

  remover: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
}))
