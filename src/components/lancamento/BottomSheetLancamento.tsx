import { useState, useEffect, useRef } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { useCategorias } from '../../hooks/useCategorias'
import { useContas } from '../../hooks/useContas'
import { useGastosVariaveis } from '../../hooks/useGastosVariaveis'
import { useToastStore } from '../../store/toastStore'
import { formatBRL } from '../../utils/formatCurrency'
import { db } from '../../db/database'
import type { TipoLancamento } from '../../db/types'

interface BottomSheetLancamentoProps {
  aberto: boolean
  onFechar: () => void
}

export function BottomSheetLancamento({ aberto, onFechar }: BottomSheetLancamentoProps) {
  const { categorias, subcategoriasParaCategoria } = useCategorias()
  const { contasAtivas } = useContas()
  const { adicionarGasto } = useGastosVariaveis()
  const { mostrar } = useToastStore()

  const [tipo, setTipo] = useState<TipoLancamento>('gasto')
  const [valor, setValor] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | null>(null)
  const [subcategoriaId, setSubcategoriaId] = useState<number | null>(null)
  const [contaId, setContaId] = useState<number | null>(null)
  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState(new Date().toISOString().slice(0, 10))
  const [salvando, setSalvando] = useState(false)
  const [mostraData, setMostraData] = useState(false)

  const inputValorRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (aberto) {
      setTimeout(() => inputValorRef.current?.focus(), 300)
    } else {
      setValor('')
      setCategoriaId(null)
      setSubcategoriaId(null)
      setDescricao('')
      setData(new Date().toISOString().slice(0, 10))
      setMostraData(false)
      setTipo('gasto')
    }
  }, [aberto])

  useEffect(() => {
    if (contasAtivas.length > 0 && contaId === null) {
      setContaId(contasAtivas[0].id ?? null)
    }
  }, [contasAtivas, contaId])

  useEffect(() => {
    setSubcategoriaId(null)
  }, [categoriaId])

  const subcats = categoriaId !== null ? subcategoriasParaCategoria(categoriaId) : []
  const categoriasExibidas = categorias.filter(c =>
    tipo === 'gasto' ? c.tipo === 'gasto' || c.tipo === 'ambos' : c.tipo === 'receita' || c.tipo === 'ambos'
  )

  async function handleSalvar() {
    const v = parseFloat(valor.replace(',', '.'))
    if (isNaN(v) || v <= 0) return
    if (categoriaId === null) return
    if (contaId === null) return

    setSalvando(true)
    try {
      await adicionarGasto({
        valor: v,
        categoriaId,
        subcategoriaId: subcategoriaId ?? undefined,
        contaId,
        descricao: descricao.trim() || undefined,
        data,
        tipo,
        criadoEm: new Date().toISOString(),
      })
      const cat = categorias.find(c => c.id === categoriaId)
      mostrar(`✓ ${formatBRL(v)} registrado em ${cat?.nome ?? 'categoria'}`, 'success')

      if (tipo === 'gasto' && categoriaId !== null && cat?.orcamentoMensal) {
        const mesAtual = new Date().toISOString().slice(0, 7)
        const gastosDoMes = await db.gastosVariaveis
          .where('data').between(`${mesAtual}-01`, `${mesAtual}-31`, true, true)
          .toArray()
        const gastoTotal = gastosDoMes
          .filter(g => g.categoriaId === categoriaId && g.tipo === 'gasto')
          .reduce((acc, g) => acc + g.valor, 0)
        const pct = (gastoTotal / cat.orcamentoMensal) * 100
        if (pct >= 100) {
          setTimeout(() => mostrar(`⚠️ Orçamento de ${cat.nome} estourado! (${pct.toFixed(0)}%)`, 'error'), 600)
        } else if (pct >= 80) {
          setTimeout(() => mostrar(`⚠️ ${cat.nome}: ${pct.toFixed(0)}% do orçamento usado`, 'warning'), 600)
        }
      }

      onFechar()
    } finally {
      setSalvando(false)
    }
  }

  const podeSalvar = valor && parseFloat(valor.replace(',', '.')) > 0 && categoriaId !== null && contaId !== null

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${aberto ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onFechar}
      />
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[var(--bg2)] rounded-t-[20px] z-50 transition-transform duration-300 ${aberto ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxHeight: '92dvh', overflowY: 'auto' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[var(--border2)]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setTipo('gasto')}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${tipo === 'gasto' ? 'bg-[var(--red)] text-white' : 'bg-[var(--bg3)] text-[var(--text2)]'}`}
            >
              Gasto
            </button>
            <button
              onClick={() => setTipo('receita_extra')}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${tipo === 'receita_extra' ? 'bg-[var(--green)] text-[#0a0a0f]' : 'bg-[var(--bg3)] text-[var(--text2)]'}`}
            >
              Receita extra
            </button>
          </div>
          <button onClick={onFechar} className="p-1.5 text-[var(--text3)]"><X size={20} /></button>
        </div>

        <div className="px-4 pb-6 flex flex-col gap-4">
          {/* Valor */}
          <div className="bg-[var(--bg3)] rounded-xl p-4 text-center">
            <p className="text-xs text-[var(--text3)] mb-1">Valor</p>
            <div className="flex items-center justify-center gap-1">
              <span className="text-[var(--text2)] font-mono text-xl">R$</span>
              <input
                ref={inputValorRef}
                type="number"
                inputMode="decimal"
                value={valor}
                onChange={e => setValor(e.target.value)}
                placeholder="0,00"
                className="bg-transparent font-mono text-4xl font-bold text-[var(--text)] w-full text-center outline-none placeholder:text-[var(--border2)]"
                style={{ minWidth: 0 }}
              />
            </div>
          </div>

          {/* Categorias */}
          <div>
            <p className="text-xs font-medium text-[var(--text3)] uppercase tracking-widest mb-2">Categoria</p>
            <div className="grid grid-cols-4 gap-2">
              {categoriasExibidas.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaId(cat.id ?? null)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                    categoriaId === cat.id
                      ? 'border-[var(--blue)] bg-[rgba(77,159,255,0.12)] text-[var(--text)]'
                      : 'border-[var(--border)] bg-[var(--bg3)] text-[var(--text2)]'
                  }`}
                >
                  <span className="text-xl leading-none">{cat.icone}</span>
                  <span className="leading-tight text-center">{cat.nome.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subcategorias */}
          {subcats.length > 0 && (
            <div>
              <p className="text-xs font-medium text-[var(--text3)] uppercase tracking-widest mb-2">Subcategoria</p>
              <div className="flex flex-wrap gap-2">
                {subcats.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setSubcategoriaId(sub.id === subcategoriaId ? null : (sub.id ?? null))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all border ${
                      subcategoriaId === sub.id
                        ? 'border-[var(--blue)] bg-[rgba(77,159,255,0.12)] text-[var(--text)]'
                        : 'border-[var(--border)] bg-[var(--bg3)] text-[var(--text2)]'
                    }`}
                  >
                    {sub.icone && <span>{sub.icone}</span>}
                    <span>{sub.nome}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conta */}
          {contasAtivas.length > 0 && (
            <div>
              <p className="text-xs font-medium text-[var(--text3)] uppercase tracking-widest mb-2">Conta</p>
              <div className="flex gap-2 flex-wrap">
                {contasAtivas.map(conta => (
                  <button
                    key={conta.id}
                    onClick={() => setContaId(conta.id ?? null)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all border ${
                      contaId === conta.id
                        ? 'border-[var(--blue)] bg-[rgba(77,159,255,0.12)] text-[var(--text)]'
                        : 'border-[var(--border)] bg-[var(--bg3)] text-[var(--text2)]'
                    }`}
                  >
                    <span>{conta.icone}</span>
                    <span>{conta.nome}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Descrição */}
          <input
            type="text"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            placeholder="Descrição (opcional) — ex: almoço com cliente"
            className="w-full bg-[var(--bg3)] border border-[var(--border2)] rounded-xl px-4 py-3 text-base text-[var(--text)] placeholder:text-[var(--text3)] outline-none focus:border-[var(--blue)]"
          />

          {/* Data */}
          <button
            onClick={() => setMostraData(v => !v)}
            className="flex items-center justify-between px-4 py-3 bg-[var(--bg3)] border border-[var(--border)] rounded-xl text-sm text-[var(--text2)]"
          >
            <span>📅 Data: {new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
            <ChevronDown size={16} className={`transition-transform ${mostraData ? 'rotate-180' : ''}`} />
          </button>
          {mostraData && (
            <input
              type="date"
              value={data}
              onChange={e => setData(e.target.value)}
              className="w-full bg-[var(--bg3)] border border-[var(--border2)] rounded-xl px-4 py-3 text-base text-[var(--text)] outline-none focus:border-[var(--blue)]"
            />
          )}

          {/* Submit */}
          <button
            onClick={() => void handleSalvar()}
            disabled={!podeSalvar || salvando}
            className="w-full py-4 rounded-xl bg-[var(--green)] text-[#0a0a0f] font-bold text-base disabled:opacity-40 transition-opacity"
          >
            {salvando ? 'Registrando...' : 'Registrar'}
          </button>
        </div>
      </div>
    </>
  )
}
