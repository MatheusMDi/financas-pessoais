import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BarChart2, CreditCard, Settings, Plus } from 'lucide-react'
import { BottomSheetLancamento } from '../lancamento/BottomSheetLancamento'

const NAV_ITEMS = [
  { to: '/',           end: true,  icon: LayoutDashboard, label: 'Início' },
  { to: '/dashboards', end: false, icon: BarChart2,        label: 'Dashboards' },
] as const

const NAV_ITEMS_RIGHT = [
  { to: '/dividas', end: false, icon: CreditCard, label: 'Dívidas' },
  { to: '/config',  end: false, icon: Settings,   label: 'Config' },
] as const

export function BottomNav() {
  const [lancamentoAberto, setLancamentoAberto] = useState(false)

  return (
    <>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[var(--bg2)] border-t border-[var(--border)] z-40">
        <div className="flex">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] transition-colors relative ${isActive ? 'text-[var(--blue)]' : 'text-[var(--text3)]'}`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[var(--blue)]" />
                    )}
                    <Icon size={20} strokeWidth={isActive ? 2 : 1.75} />
                    <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}

          {/* FAB central */}
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={() => setLancamentoAberto(true)}
              className="w-12 h-12 rounded-full bg-[var(--blue)] text-white flex items-center justify-center shadow-lg shadow-black/30 -mt-4 active:scale-95 transition-transform"
              aria-label="Registrar lançamento"
            >
              <Plus size={24} strokeWidth={2.5} />
            </button>
          </div>

          {NAV_ITEMS_RIGHT.map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] transition-colors relative ${isActive ? 'text-[var(--blue)]' : 'text-[var(--text3)]'}`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[var(--blue)]" />
                    )}
                    <Icon size={20} strokeWidth={isActive ? 2 : 1.75} />
                    <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>

      <BottomSheetLancamento
        aberto={lancamentoAberto}
        onFechar={() => setLancamentoAberto(false)}
      />
    </>
  )
}
