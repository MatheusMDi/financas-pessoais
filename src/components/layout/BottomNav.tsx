import { NavLink } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, CreditCard, Calculator, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Início' },
  { to: '/fluxo', icon: TrendingUp, label: 'Fluxo' },
  { to: '/dividas', icon: CreditCard, label: 'Dívidas' },
  { to: '/simulador', icon: Calculator, label: 'Simular' },
  { to: '/config', icon: Settings, label: 'Config' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[var(--bg2)] border-t border-[var(--border)] z-40">
      <div className="flex">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] transition-colors ${
                isActive ? 'text-[var(--blue)]' : 'text-[var(--text3)]'
              }`
            }
          >
            <Icon size={20} strokeWidth={1.75} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
