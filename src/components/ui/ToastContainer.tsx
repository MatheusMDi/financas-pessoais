import { X } from 'lucide-react'
import { useToastStore } from '../../store/toastStore'

export function ToastContainer() {
  const { toasts, remover } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-[390px] px-4 pointer-events-none">
      {toasts.map(t => {
        const bg =
          t.tipo === 'success' ? 'bg-[rgba(0,229,160,0.12)] border-[var(--green)] text-[var(--green)]'
          : t.tipo === 'warning' ? 'bg-[rgba(255,209,102,0.12)] border-[var(--yellow)] text-[var(--yellow)]'
          : 'bg-[rgba(255,77,106,0.12)] border-[var(--red)] text-[var(--red)]'

        return (
          <div
            key={t.id}
            className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium backdrop-blur-sm pointer-events-auto ${bg}`}
          >
            <span>{t.mensagem}</span>
            <button onClick={() => remover(t.id)} className="shrink-0 opacity-70 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
