import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { AtualTab } from '../components/dashboard/AtualTab'
import { ProjecaoPage } from './ProjecaoPage'

type Tab = 'atual' | 'projecao'

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

      {/* Segmented control */}
      <div className="px-4 mb-3">
        <div className="flex bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-1 gap-1">
          {(['atual', 'projecao'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => changeTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === t
                  ? 'bg-[var(--blue)] text-white shadow-sm'
                  : 'text-[var(--text3)] hover:text-[var(--text2)]'
              }`}
            >
              {t === 'atual' ? 'Atual' : 'Projeção'}
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
