import { HashRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { Shell } from './components/layout/Shell'
import { BottomNav } from './components/layout/BottomNav'
import { ToastContainer } from './components/ui/ToastContainer'
import { Dashboard } from './pages/Dashboard'
import { FluxoPage } from './pages/FluxoPage'
import { DividasPage } from './pages/DividasPage'
import { CartoesPage } from './pages/CartoesPage'
import { ImpostosPage } from './pages/ImpostosPage'
import { MetasPage } from './pages/MetasPage'
import { SimuladorPage } from './pages/SimuladorPage'
import { ConfigPage } from './pages/ConfigPage'
import { RelatoriosPage } from './pages/RelatoriosPage'
import { useThemeStore } from './store/themeStore'

export function App() {
  const { carregarTema } = useThemeStore()

  useEffect(() => {
    void carregarTema()
  }, [carregarTema])

  return (
    <HashRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/fluxo" element={<FluxoPage />} />
          <Route path="/relatorios" element={<RelatoriosPage />} />
          <Route path="/dividas" element={<DividasPage />} />
          <Route path="/cartoes" element={<CartoesPage />} />
          <Route path="/impostos" element={<ImpostosPage />} />
          <Route path="/metas" element={<MetasPage />} />
          <Route path="/simulador" element={<SimuladorPage />} />
          <Route path="/config" element={<ConfigPage />} />
        </Routes>
        <BottomNav />
        <ToastContainer />
      </Shell>
    </HashRouter>
  )
}
