import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { AtualTab } from '../components/dashboard/AtualTab'
import { ProjecaoPage } from './ProjecaoPage'

type Tab = 'atual' | 'projecao'

const TABS: { id: Tab; label: string }[] = [
  { id: 'atual',    label: 'Atual' },
  { id: 'projecao', label: 'Projeção' },
]

export function DashboardsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>(() => {
    const p = searchParams.get('tab')
    return p === 'projecao' ? 'projecao' : 'atual'
  })

  useEffect(() => {
    const p = searchParams.get('tab')
    const next: Tab = p === 'projecao' ? 'projecao' : 'atual'
    if (next !== tab) setTab(next)
  }, [searchParams])

  function changeTab(t: Tab) {
    setTab(t)
    setSearchParams(t === 'atual' ? {} : { tab: t }, { replace: true })
  }

  return (
    <div className="flex flex-col flex-1 pb-20">
      <Header titulo="Dashboards" />

      {/* Tab bar — Binance underline style */}
      <div className="px-4 mb-1">
        <div className="flex border-b border-[var(--border)]">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => changeTab(t.id)}
              className="relative flex-1 py-2.5 text-sm font-semibold transition-colors"
              style={{ color: tab === t.id ? 'var(--blue)' : 'var(--text3)' }}
            >
              {t.label}
              {/* Active underline */}
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-full transition-all"
                style={{
                  width: tab === t.id ? '60%' : 0,
                  height: 2,
                  background: 'var(--blue)',
                  opacity: tab === t.id ? 1 : 0,
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {tab === 'atual' ? (
        <AtualTab />
      ) : (
        <ProjecaoPage embedded />
      )}
    </div>
  )
}
