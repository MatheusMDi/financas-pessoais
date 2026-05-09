import { useState, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Moon, Sun, Upload, Info, User, Wallet, CreditCard as CardIcon,
  Tag, BarChart2, Database, Trash2, Plus, ChevronDown, ChevronRight, Check, Palette
} from 'lucide-react'
import { db } from '../db/database'
import { useThemeStore, ACCENT_CORES, type AccentKey } from '../store/themeStore'
import { useCategorias } from '../hooks/useCategorias'
import { useContas } from '../hooks/useContas'
import { useToastStore } from '../store/toastStore'
import { Header } from '../components/layout/Header'
import { ExportButton } from '../components/importexport/ExportButton'
import { ImportModal } from '../components/importexport/ImportModal'
import { formatBRL } from '../utils/formatCurrency'
import type { Conta } from '../db/types'

type Section = 'perfil' | 'contas' | 'categorias' | 'orcamentos' | 'metricas' | 'dados' | 'aparencia' | 'perigo'

async function salvarConfig(chave: string, valor: string) {
  const existing = await db.configuracoes.where('chave').equals(chave).first()
  if (existing?.id !== undefined) {
    await db.configuracoes.update(existing.id, { valor })
  } else {
    await db.configuracoes.add({ chave, valor })
  }
}

export function ConfigPage() {
  const { tema, accent, toggleTema, setAccent } = useThemeStore()
  const { categorias, atualizarCategoria, removerCategoria } = useCategorias()
  const { contas, arquivarConta } = useContas()
  const { mostrar } = useToastStore()
  const [mostraImport, setMostraImport] = useState(false)
  const [activeSection, setActiveSection] = useState<Section | null>('perfil')
  const [confirmDelete, setConfirmDelete] = useState('')
  const [novaConta, setNovaConta] = useState(false)
  const [novaContaNome, setNovaContaNome] = useState('')
  const [novaContaTipo, setNovaContaTipo] = useState<Conta['tipo']>('corrente')

  const configuracoes = useLiveQuery(() => db.configuracoes.toArray(), []) ?? []

  function getConfig(chave: string, padrao = '') {
    return configuracoes.find(c => c.chave === chave)?.valor ?? padrao
  }

  async function handleSaveField(chave: string, valor: string, label: string) {
    await salvarConfig(chave, valor)
    mostrar(`${label} salvo`, 'success')
  }

  async function handleAdicionarConta() {
    if (!novaContaNome.trim()) return
    await db.contas.add({
      nome: novaContaNome.trim(),
      tipo: novaContaTipo,
      saldoInicial: 0,
      cor: '#4D9FFF',
      icone: '🏦',
      ativa: true,
    })
    setNovaContaNome('')
    setNovaConta(false)
    mostrar('Conta adicionada', 'success')
  }

  async function handleLimparDados() {
    if (confirmDelete !== 'CONFIRMAR') return

    // Apagar dados operacionais
    await db.transaction('rw', [
      db.gastosVariaveis, db.dividas, db.cartoes, db.impostos,
      db.gastosFuturos, db.metas, db.rendaMensal, db.configuracoes,
    ], async () => {
      await db.gastosVariaveis.clear()
      await db.dividas.clear()
      await db.cartoes.clear()
      await db.impostos.clear()
      await db.gastosFuturos.clear()
      await db.metas.clear()
      await db.rendaMensal.clear()
      // Apagar apenas chaves operacionais, preservando tema e corSecundaria
      const operacionais = [
        'saldoAtual', 'nomeUsuario', 'rendaMensal', 'diaRecebimento',
        'mesesReservaAlvo', 'percentualMaxComprometido', 'alertaOrcamentoPct', 'diasAlertaVencimento',
      ]
      for (const chave of operacionais) {
        await db.configuracoes.where('chave').equals(chave).delete()
      }
    })

    mostrar('Dados operacionais apagados. Categorias e contas preservadas.', 'success')
    setConfirmDelete('')
    window.location.reload()
  }

  function SectionHeader({ id, icon: Icon, label, color = 'text-[var(--blue)]' }: { id: Section; icon: React.ElementType; label: string; color?: string }) {
    const open = activeSection === id
    return (
      <button
        onClick={() => setActiveSection(open ? null : id)}
        className="flex items-center justify-between w-full px-4 py-3.5 bg-[var(--bg3)] border border-[var(--border)] rounded-xl text-[var(--text)]"
      >
        <div className="flex items-center gap-3">
          <Icon size={18} className={color} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <ChevronDown size={16} className={`text-[var(--text3)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
    )
  }

  return (
    <div className="flex flex-col flex-1 pb-24">
      <Header titulo="Configurações" />

      <div className="px-4 flex flex-col gap-3 pt-2">

        {/* PERFIL */}
        <div>
          <SectionHeader id="perfil" icon={User} label="Perfil & Renda" color="text-[var(--green)]" />
          {activeSection === 'perfil' && (
            <div className="mt-2 bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-4 flex flex-col gap-3">
              <ConfigField
                label="Seu nome"
                value={getConfig('nomeUsuario')}
                placeholder="Ex: Matheus"
                onSave={v => handleSaveField('nomeUsuario', v, 'Nome')}
              />
              <ConfigField
                label="Renda mensal líquida (R$)"
                value={getConfig('rendaMensal', '0')}
                type="number"
                placeholder="Ex: 8000"
                onSave={v => handleSaveField('rendaMensal', v, 'Renda mensal')}
              />
              <ConfigField
                label="Dia de recebimento"
                value={getConfig('diaRecebimento', '5')}
                type="number"
                placeholder="Ex: 5"
                onSave={v => handleSaveField('diaRecebimento', v, 'Dia de recebimento')}
              />
              <ConfigField
                label="Saldo disponível atual (R$)"
                value={getConfig('saldoAtual', '0')}
                type="number"
                placeholder="Ex: 4500"
                onSave={v => handleSaveField('saldoAtual', v, 'Saldo')}
              />
            </div>
          )}
        </div>

        {/* CONTAS */}
        <div>
          <SectionHeader id="contas" icon={Wallet} label="Contas" color="text-[var(--blue)]" />
          {activeSection === 'contas' && (
            <div className="mt-2 bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-4 flex flex-col gap-2">
              {contas.map(conta => (
                <div key={conta.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <div className="flex items-center gap-2">
                    <span>{conta.icone}</span>
                    <div>
                      <p className="text-sm text-[var(--text)]">{conta.nome}</p>
                      <p className="text-xs text-[var(--text3)]">{conta.tipo}</p>
                    </div>
                  </div>
                  {conta.ativa && conta.id !== undefined && (
                    <button
                      onClick={() => void arquivarConta(conta.id!)}
                      className="text-xs text-[var(--text3)] px-2 py-1 rounded-lg border border-[var(--border)]"
                    >
                      Arquivar
                    </button>
                  )}
                  {!conta.ativa && (
                    <span className="text-xs text-[var(--text3)]">Arquivada</span>
                  )}
                </div>
              ))}
              {novaConta ? (
                <div className="flex flex-col gap-2 pt-2">
                  <input
                    value={novaContaNome}
                    onChange={e => setNovaContaNome(e.target.value)}
                    placeholder="Nome da conta"
                    className="w-full bg-[var(--bg)] border border-[var(--border2)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--blue)]"
                  />
                  <select
                    value={novaContaTipo}
                    onChange={e => setNovaContaTipo(e.target.value as Conta['tipo'])}
                    className="w-full bg-[var(--bg)] border border-[var(--border2)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none"
                  >
                    <option value="corrente">Conta Corrente</option>
                    <option value="poupanca">Poupança</option>
                    <option value="investimento">Investimento</option>
                    <option value="carteira">Carteira</option>
                    <option value="outro">Outro</option>
                  </select>
                  <div className="flex gap-2">
                    <button onClick={() => { setNovaConta(false); setNovaContaNome('') }} className="flex-1 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text3)]">Cancelar</button>
                    <button onClick={() => void handleAdicionarConta()} className="flex-1 py-2 rounded-lg bg-[var(--blue)] text-white text-sm font-semibold">Adicionar</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setNovaConta(true)} className="flex items-center gap-2 text-sm text-[var(--blue)] pt-1">
                  <Plus size={14} /> Nova conta
                </button>
              )}
            </div>
          )}
        </div>

        {/* CATEGORIAS */}
        <div>
          <SectionHeader id="categorias" icon={Tag} label="Categorias" color="text-[var(--purple)]" />
          {activeSection === 'categorias' && (
            <div className="mt-2 bg-[var(--bg3)] border border-[var(--border)] rounded-xl overflow-hidden">
              {categorias.map(cat => (
                <div key={cat.id} className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] last:border-0">
                  <div className="flex items-center gap-2">
                    <span>{cat.icone}</span>
                    <div>
                      <p className="text-sm text-[var(--text)]">{cat.nome}</p>
                      <p className="text-xs text-[var(--text3)]">{cat.tipo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: cat.cor }} />
                    {!cat.padrao && cat.id !== undefined && (
                      <button
                        onClick={() => void removerCategoria(cat.id!)}
                        className="p-1 text-[var(--text3)] hover:text-[var(--red)]"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ORÇAMENTOS */}
        <div>
          <SectionHeader id="orcamentos" icon={BarChart2} label="Orçamentos mensais" color="text-[var(--yellow)]" />
          {activeSection === 'orcamentos' && (
            <div className="mt-2 bg-[var(--bg3)] border border-[var(--border)] rounded-xl overflow-hidden">
              {categorias.filter(c => c.tipo !== 'receita').map(cat => (
                <OrcamentoRow
                  key={cat.id}
                  nome={cat.nome}
                  icone={cat.icone}
                  valor={cat.orcamentoMensal ?? 0}
                  cor={cat.cor}
                  onSave={v => cat.id !== undefined ? atualizarCategoria(cat.id, { orcamentoMensal: v }) : Promise.resolve()}
                />
              ))}
            </div>
          )}
        </div>

        {/* MÉTRICAS */}
        <div>
          <SectionHeader id="metricas" icon={CardIcon} label="Métricas & Alertas" color="text-[var(--red)]" />
          {activeSection === 'metricas' && (
            <div className="mt-2 bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-4 flex flex-col gap-3">
              <ConfigField
                label="Meta: meses de reserva de emergência"
                value={getConfig('mesesReservaAlvo', '3')}
                type="number"
                placeholder="3"
                onSave={v => handleSaveField('mesesReservaAlvo', v, 'Meta de reserva')}
              />
              <ConfigField
                label="% máx. comprometido da renda"
                value={getConfig('percentualMaxComprometido', '70')}
                type="number"
                placeholder="70"
                onSave={v => handleSaveField('percentualMaxComprometido', v, 'Percentual máximo')}
              />
              <ConfigField
                label="Alerta de orçamento (%)"
                value={getConfig('alertaOrcamentoPct', '80')}
                type="number"
                placeholder="80"
                onSave={v => handleSaveField('alertaOrcamentoPct', v, 'Alerta de orçamento')}
              />
              <ConfigField
                label="Dias para alertar vencimento de dívida"
                value={getConfig('diasAlertaVencimento', '5')}
                type="number"
                placeholder="5"
                onSave={v => handleSaveField('diasAlertaVencimento', v, 'Dias de alerta')}
              />
            </div>
          )}
        </div>

        {/* DADOS */}
        <div>
          <SectionHeader id="dados" icon={Database} label="Backup & Dados" color="text-[var(--blue)]" />
          {activeSection === 'dados' && (
            <div className="mt-2 flex flex-col gap-2">
              <ExportButton />
              <button
                onClick={() => setMostraImport(true)}
                className="flex items-center gap-2 w-full px-4 py-3.5 rounded-xl bg-[var(--bg3)] border border-[var(--border)] text-[var(--text)] text-sm font-medium"
              >
                <Upload size={18} className="text-[var(--yellow)]" />
                Importar JSON / CSV
              </button>
            </div>
          )}
        </div>

        {/* APARÊNCIA */}
        <div>
          <SectionHeader id="aparencia" icon={tema === 'dark' ? Moon : Sun} label="Aparência" />
          {activeSection === 'aparencia' && (
            <div className="mt-2 flex flex-col gap-2">
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

              {/* Cor secundária (accent) */}
              <div className="px-4 py-3.5 rounded-xl bg-[var(--bg3)] border border-[var(--border)]">
                <div className="flex items-center gap-2 mb-3">
                  <Palette size={16} className="text-[var(--blue)]" />
                  <p className="text-sm font-medium text-[var(--text)]">Cor de destaque</p>
                </div>
                <div className="flex gap-3">
                  {(Object.entries(ACCENT_CORES) as [AccentKey, typeof ACCENT_CORES[AccentKey]][]).map(([key, info]) => (
                    <button
                      key={key}
                      onClick={() => void setAccent(key)}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <div
                        className="w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center"
                        style={{
                          background: tema === 'dark' ? info.dark : info.light,
                          borderColor: accent === key ? 'var(--text)' : 'transparent',
                          boxShadow: accent === key ? `0 0 0 2px var(--bg3), 0 0 0 4px ${tema === 'dark' ? info.dark : info.light}` : 'none',
                        }}
                      >
                        {accent === key && <Check size={14} className="text-white" />}
                      </div>
                      <p className="text-[9px] text-[var(--text3)]">{info.nome}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* NAVEGAÇÃO EXTRA */}
        <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl overflow-hidden">
          {[
            { href: '/relatorios', label: '📊 Relatórios' },
            { href: '/impostos', label: '🧾 Impostos' },
            { href: '/metas', label: '🎯 Metas' },
            { href: '/cartoes', label: '💳 Cartões' },
            { href: '/fluxo', label: '📈 Fluxo de Caixa' },
          ].map(item => (
            <a
              key={item.href}
              href={`#${item.href}`}
              className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--border)] last:border-0 text-sm text-[var(--text)]"
            >
              {item.label}
              <ChevronRight size={14} className="text-[var(--text3)]" />
            </a>
          ))}
        </div>

        {/* ZONA DE PERIGO */}
        <div>
          <SectionHeader id="perigo" icon={Trash2} label="Zona de Perigo" color="text-[var(--red)]" />
          {activeSection === 'perigo' && (
            <div className="mt-2 bg-[var(--bg3)] border border-[rgba(255,77,106,0.3)] rounded-xl p-4 flex flex-col gap-3">
              <p className="text-sm text-[var(--text2)]">
                Esta ação apagará <strong className="text-[var(--red)]">todos os lançamentos, dívidas, metas e histórico</strong>. Categorias e contas são mantidas. Irreversível.
              </p>
              <p className="text-xs text-[var(--text3)]">Digite <strong>CONFIRMAR</strong> para habilitar o botão:</p>
              <input
                value={confirmDelete}
                onChange={e => setConfirmDelete(e.target.value)}
                placeholder="CONFIRMAR"
                className="w-full bg-[var(--bg)] border border-[rgba(255,77,106,0.3)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--red)]"
              />
              <button
                onClick={() => void handleLimparDados()}
                disabled={confirmDelete !== 'CONFIRMAR'}
                className="w-full py-3 rounded-xl bg-[var(--red)] text-white font-semibold text-sm disabled:opacity-30 transition-opacity"
              >
                Apagar todos os dados
              </button>
            </div>
          )}
        </div>

        {/* SOBRE */}
        <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-4 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Info size={14} className="text-[var(--blue)]" />
            <p className="text-sm font-semibold text-[var(--text)]">MD Finanças v2.0</p>
          </div>
          <p className="text-xs text-[var(--text3)]">React 18 · TypeScript · Dexie.js · Recharts · TailwindCSS · PWA</p>
          <p className="text-xs text-[var(--text3)]">Dados armazenados localmente via IndexedDB — sem servidor, sem nuvem.</p>
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

function ConfigField({
  label, value, type = 'text', placeholder, onSave
}: {
  label: string
  value: string
  type?: string
  placeholder?: string
  onSave: (v: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  async function save() {
    await onSave(local)
    setEditing(false)
  }

  if (!editing) {
    return (
      <button
        onClick={() => { setLocal(value); setEditing(true); setTimeout(() => inputRef.current?.focus(), 50) }}
        className="flex items-center justify-between w-full py-1"
      >
        <p className="text-xs text-[var(--text3)]">{label}</p>
        <p className="text-sm font-mono font-medium text-[var(--text)]">
          {value || <span className="text-[var(--text3)] font-normal italic">não definido</span>}
        </p>
      </button>
    )
  }

  return (
    <div>
      <p className="text-xs text-[var(--text3)] mb-1">{label}</p>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type={type}
          value={local}
          onChange={e => setLocal(e.target.value)}
          placeholder={placeholder}
          onKeyDown={e => e.key === 'Enter' && void save()}
          className="flex-1 bg-[var(--bg)] border border-[var(--border2)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--blue)]"
        />
        <button onClick={() => void save()} className="p-2 rounded-lg bg-[var(--blue)] text-white">
          <Check size={14} />
        </button>
      </div>
    </div>
  )
}

function OrcamentoRow({
  nome, icone, valor, cor, onSave
}: {
  nome: string
  icone: string
  valor: number
  cor: string
  onSave: (v: number) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState(String(valor || ''))

  async function save() {
    const v = parseFloat(local) || 0
    await onSave(v)
    setEditing(false)
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] last:border-0">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cor }} />
        <span className="text-sm">{icone}</span>
        <p className="text-sm text-[var(--text)]">{nome}</p>
      </div>
      {editing ? (
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={local}
            onChange={e => setLocal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && void save()}
            autoFocus
            placeholder="0"
            className="w-24 bg-[var(--bg)] border border-[var(--border2)] rounded-lg px-2 py-1 text-sm text-[var(--text)] outline-none text-right"
          />
          <button onClick={() => void save()} className="p-1 rounded-lg bg-[var(--blue)] text-white">
            <Check size={12} />
          </button>
        </div>
      ) : (
        <button onClick={() => { setLocal(String(valor || '')); setEditing(true) }} className="text-sm font-mono text-[var(--text2)]">
          {valor > 0 ? formatBRL(valor) : <span className="text-[var(--text3)] text-xs">definir</span>}
        </button>
      )}
    </div>
  )
}
