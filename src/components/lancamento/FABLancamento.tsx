import { Plus } from 'lucide-react'
import { useState } from 'react'
import { BottomSheetLancamento } from './BottomSheetLancamento'

export function FABLancamento() {
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="fixed bottom-[76px] right-5 z-50 w-14 h-14 rounded-full bg-[var(--green)] text-[#0a0a0f] flex items-center justify-center shadow-lg shadow-black/40 active:scale-95 transition-transform"
        aria-label="Lançar gasto"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>
      <BottomSheetLancamento aberto={aberto} onFechar={() => setAberto(false)} />
    </>
  )
}
