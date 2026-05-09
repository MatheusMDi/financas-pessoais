import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Moon, Sun, Upload, Info } from 'lucide-react'
import { db } from '../db/database'
import { useThemeStore } from '../store/themeStore'
import { Header } from '../components/layout/Header'
import { ExportButton } from '../components/importexport/ExportButton'
import { ImportModal } from '../components/importexport/ImportModal'
import { FormInput } from '../components/ui/FormInput'
import { formatBRL } from '../utils/formatCurrency'

export function ConfigPage() {
  const { tema, toggleTema } = useThemeStore()
  const [mostraImport, setMostraImport] = useState(false)
  const [saldoInput, setSaldoInput] = useState('')
  const [salvandoSaldo, setSalvandoSaldo] = useState(false)

  const configuracoes = useLiveQuery(() => db.configuracoes.toArray(), []) ?? []
  const saldoAtual = configuracoes.find((c: { chave: string }) => c.chave === 'saldoAtual')?.valor ?? '0'

  async function salvarSaldo() {
    const valor = parseFloat(saldoInput)
    if (isNaN(valor)) return
    setSalvandoSaldo(true)
    try {
      const existing = await db.configuracoes.where('chave').equals('saldoAtual').first()
      if (existing?.id !== undefined) {
        await db.configuracoes.update(existing.id, { valor: String(valor) })
      } else {
        await db.configuracoes.add({ chave: 'saldoAtual', valor: String(valor) })
      }
      setSaldoInput('')
    } finally {
      setSalvandoSaldo(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 pb-24">
      <Header titulo="Configurações" />

      <div className="px-4 flex flex-col gap-5 pt-2">
        {/* Saldo atual */}
        <div>
          <p className="text-xs font-medium text-[var(--text3)] uppercase tracking-widest mb-2">Saldo atual</p>
          <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-4">
            <p className="text-sm text-[var(--text2)] mb-1">Valor atual: <span className="font-mono font-semibold text-[var(--text)]">{formatBRL(parseFloat(saldoAtual))}</span></p>
            <div className="flex gap-2 mt-2">
              <FormInput
                label=""
                type="number"
                inputMode="decimal"
                value={saldoInput}
                onChange={e => setSaldoInput(e.target.value)}
                placeholder="Novo saldo (R$)"
              />
              <button
                onClick={() => void salvarSaldo()}
                disabled={salvandoSaldo || !saldoInput}
                className="px-4 py-2 rounded-xl bg-[var(--green)] text-[#0a0a0f] font-semibold text-sm shrink-0 self-end mb-px disabled:opacity-60"
              >
                OK
              </button>
            </div>
          </div>
        </div>

        {/* Tema */}
        <div>
          <p className="text-xs font-medium text-[var(--text3)] uppercase tracking-widest mb-2">Aparência</p>
          <button
            onClick={() => void toggleTema()}
            className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl bg-[var(--bg3)] border border-[var(--border)] text-[var(--text)]"
          >
            <div className="flex items-center gap-3">
              {tema === 'dark' ? <Moon size={18} className="text-[var(--purple)]" /> : <Sun size={18} className="text-[var(--yellow)]" />}
              <span className="text-sm font-medium">{tema === 'dark' ? 'Tema escuro' : 'Tema claro'}</span>
            </div>
            <span className="text-xs text-[var(--text3)]">Toque para alternar</span>
          </button>
        </div>

        {/* Backup */}
        <div>
          <p className="text-xs font-medium text-[var(--text3)] uppercase tracking-widest mb-2">Backup & Restauração</p>
          <div className="flex flex-col gap-2">
            <ExportButton />
            <button
              onClick={() => setMostraImport(true)}
              className="flex items-center gap-2 w-full px-4 py-3.5 rounded-xl bg-[var(--bg3)] border border-[var(--border)] text-[var(--text)] text-sm font-medium"
            >
              <Upload size={18} className="text-[var(--yellow)]" />
              Importar JSON / CSV
            </button>
          </div>
        </div>

        {/* Navegação extra */}
        <div>
          <p className="text-xs font-medium text-[var(--text3)] uppercase tracking-widest mb-2">Mais</p>
          <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl overflow-hidden">
            {[
              { href: '/impostos', label: '🧾 Impostos' },
              { href: '/metas', label: '🎯 Metas' },
              { href: '/cartoes', label: '💳 Cartões' },
            ].map(item => (
              <a
                key={item.href}
                href={`#${item.href}`}
                className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--border)] last:border-0 text-sm text-[var(--text)]"
              >
                {item.label}
                <span className="text-[var(--text3)]">›</span>
              </a>
            ))}
          </div>
        </div>

        {/* Sobre */}
        <div>
          <p className="text-xs font-medium text-[var(--text3)] uppercase tracking-widest mb-2">Sobre</p>
          <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-[var(--blue)]" />
              <p className="text-sm font-semibold text-[var(--text)]">MD Finanças</p>
            </div>
            <p className="text-xs text-[var(--text3)]">Versão 1.0.0</p>
            <p className="text-xs text-[var(--text3)] leading-relaxed">
              React 18 · TypeScript · Dexie.js · Recharts · TailwindCSS · PWA
            </p>
            <p className="text-xs text-[var(--text3)]">Dados armazenados localmente via IndexedDB</p>
          </div>
        </div>
      </div>

      {mostraImport && (
        <ImportModal
          onFechar={() => setMostraImport(false)}
          onSucesso={() => window.location.reload()}
        />
      )}
    </div>
  )
}
