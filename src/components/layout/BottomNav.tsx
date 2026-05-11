import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BarChart2, CreditCard, Settings, Plus } from 'lucide-react'
import { BottomSheetLancamento } from '../lancamento/BottomSheetLancamento'

const LEFT_ITEMS = [
  { to: '/',           end: true,  icon: LayoutDashboard, label: 'Início' },
  { to: '/dashboards', end: false, icon: BarChart2,        label: 'Dashboards' },
] as const

const RIGHT_ITEMS = [
  { to: '/dividas', end: false, icon: CreditCard, label: 'Dívidas' },
  { to: '/config',  end: false, icon: Settings,   label: 'Config' },
] as const

function NavItem({ to, end, icon: Icon, label }: { to: string; end: boolean; icon: React.ElementType; label: string }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex-1 flex flex-col items-center justify-center gap-1 pt-2 pb-2 min-h-[56px] relative transition-colors ${
          isActive ? 'text-[var(--blue)]' : 'text-[var(--text3)]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* Active top indicator — Binance-style */}
          <span
            className="absolute top-0 left-1/2 -translate-x-1/2 rounded-b-full transition-all"
            style={{
              width: isActive ? 24 : 0,
              height: 2,
              background: 'var(--blue)',
              opacity: isActive ? 1 : 0,
            }}
          />
          <Icon size={20} strokeWidth={isActive ? 2.25 : 1.75} />
          <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
        </>
      )}
    </NavLink>
  )
}

export function BottomNav() {
  const [lancamentoAberto, setLancamentoAberto] = useState(false)

  return (
    <>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40"
        style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)' }}
      >
        <div className="flex">
          {LEFT_ITEMS.map(item => <NavItem key={item.to} {...item} />)}

          {/* FAB — yellow + dark text (Binance primary CTA pattern) */}
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={() => setLancamentoAberto(true)}
              className="w-12 h-12 rounded-full flex items-center justify-center -mt-5 active:scale-95"
              style={{
                background: 'var(--blue)',
                color: 'var(--on-accent)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
                transition: 'transform 0.1s',
              }}
              aria-label="Registrar lançamento"
            >
              <Plus size={22} strokeWidth={2.5} />
            </button>
          </div>

          {RIGHT_ITEMS.map(item => <NavItem key={item.to} {...item} />)}
        </div>

        {/* iOS safe area fill */}
        <div className="h-safe-bottom" style={{ background: 'var(--bg2)' }} />
      </nav>

      <BottomSheetLancamento
        aberto={lancamentoAberto}
        onFechar={() => setLancamentoAberto(false)}
      />
    </>
  )
}
