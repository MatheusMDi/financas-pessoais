import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, CreditCard, Settings, Plus } from 'lucide-react'
import { BottomSheetLancamento } from '../lancamento/BottomSheetLancamento'

export function BottomNav() {
  const [lancamentoAberto, setLancamentoAberto] = useState(false)

  return (
    <>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[var(--bg2)] border-t border-[var(--border)] z-40">
        <div className="flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] transition-colors ${isActive ? 'text-[var(--blue)]' : 'text-[var(--text3)]'}`
            }
          >
            <LayoutDashboard size={20} strokeWidth={1.75} />
            <span className="text-[10px] font-medium">Início</span>
          </NavLink>

          <NavLink
            to="/projecao"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] transition-colors ${isActive ? 'text-[var(--blue)]' : 'text-[var(--text3)]'}`
            }
          >
            <TrendingUp size={20} strokeWidth={1.75} />
            <span className="text-[10px] font-medium">Projeção</span>
          </NavLink>

          {/* FAB central */}
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={() => setLancamentoAberto(true)}
              className="w-12 h-12 rounded-full bg-[var(--green)] text-[#0a0a0f] flex items-center justify-center shadow-lg shadow-black/30 -mt-4 active:scale-95 transition-transform"
              aria-label="Registrar lançamento"
            >
              <Plus size={24} strokeWidth={2.5} />
            </button>
          </div>

          <NavLink
            to="/dividas"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] transition-colors ${isActive ? 'text-[var(--blue)]' : 'text-[var(--text3)]'}`
            }
          >
            <CreditCard size={20} strokeWidth={1.75} />
            <span className="text-[10px] font-medium">Dívidas</span>
          </NavLink>

          <NavLink
            to="/config"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] transition-colors ${isActive ? 'text-[var(--blue)]' : 'text-[var(--text3)]'}`
            }
          >
            <Settings size={20} strokeWidth={1.75} />
            <span className="text-[10px] font-medium">Config</span>
          </NavLink>
        </div>
      </nav>

      <BottomSheetLancamento
        aberto={lancamentoAberto}
        onFechar={() => setLancamentoAberto(false)}
      />
    </>
  )
}
