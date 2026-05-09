import { useState } from 'react'
import { X } from 'lucide-react'
import { FormInput } from '../ui/FormInput'
import { FormSelect } from '../ui/FormSelect'
import type { Divida, TipoDivida, OrigemFinanceira, StatusDivida } from '../../db/types'

interface DividaFormProps {
  onSalvar: (divida: Omit<Divida, 'id'>) => Promise<void>
  onFechar: () => void
  inicial?: Partial<Divida>
}

const TIPOS: { value: TipoDivida; label: string }[] = [
  { value: 'parcela_fixa', label: 'Parcela Fixa' },
  { value: 'cartao', label: 'Cartão' },
  { value: 'emprestimo_pf', label: 'Empréstimo PF' },
  { value: 'emprestimo_pj', label: 'Empréstimo PJ' },
  { value: 'outro', label: 'Outro' },
]

const STATUS: { value: StatusDivida; label: string }[] = [
  { value: 'em_aberto', label: 'Em aberto' },
  { value: 'atencao', label: 'Atenção' },
  { value: 'quitado', label: 'Quitado' },
]

const RECORRENCIAS = [
  { value: 'nenhuma', label: 'Nenhuma (lançar manualmente)' },
  { value: 'fixa', label: 'Fixa (valor igual todo mês)' },
  { value: 'variavel', label: 'Variável (valor muda todo mês)' },
]

export function DividaForm({ onSalvar, onFechar, inicial }: DividaFormProps) {
  const [nome, setNome] = useState(inicial?.nome ?? '')
  const [tipo, setTipo] = useState<TipoDivida>(inicial?.tipo ?? 'parcela_fixa')
  const [origem, setOrigem] = useState<OrigemFinanceira>(inicial?.origem ?? 'PF')
  const [valorTotal, setValorTotal] = useState(String(inicial?.valorTotal ?? ''))
  const [valorParcela, setValorParcela] = useState(String(inicial?.valorParcela ?? ''))
  const [parcelasTotais, setParcelasTotais] = useState(String(inicial?.parcelasTotais ?? ''))
  const [parcelasPagas, setParcelasPagas] = useState(String(inicial?.parcelasPagas ?? '0'))
  const [vencimentoDia, setVencimentoDia] = useState(String(inicial?.vencimentoDia ?? ''))
  const [status, setStatus] = useState<StatusDivida>(inicial?.status ?? 'em_aberto')
  const [recorrencia, setRecorrencia] = useState<'nenhuma' | 'fixa' | 'variavel'>(inicial?.recorrencia ?? 'nenhuma')
  const [observacoes, setObservacoes] = useState(inicial?.observacoes ?? '')
  const [salvando, setSalvando] = useState(false)
  const [erros, setErros] = useState<Record<string, string>>({})

  const parcelasTotaisNum = parseInt(parcelasTotais) || 0
  const parcelasPagasNum = parseInt(parcelasPagas) || 0
  const valorParcelaNum = parseFloat(valorParcela) || 0
  const restantes = Math.max(0, parcelasTotaisNum - parcelasPagasNum)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const novosErros: Record<string, string> = {}

    if (!nome.trim()) novosErros.nome = 'Nome obrigatório'
    if (!valorParcela || isNaN(parseFloat(valorParcela))) novosErros.valorParcela = 'Valor inválido'
    if (!parcelasTotais || isNaN(parseInt(parcelasTotais))) novosErros.parcelasTotais = 'Número inválido'
    if (!vencimentoDia || isNaN(parseInt(vencimentoDia)) || parseInt(vencimentoDia) < 1 || parseInt(vencimentoDia) > 31) {
      novosErros.vencimentoDia = 'Dia inválido (1-31)'
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros)
      return
    }

    setSalvando(true)
    try {
      const vp = parseFloat(valorParcela)
      const pt = parseInt(parcelasTotais)
      const pp = parseInt(parcelasPagas) || 0
      const vt = valorTotal ? parseFloat(valorTotal) : vp * (pt - pp)

      await onSalvar({
        nome: nome.trim(),
        tipo,
        origem,
        valorTotal: vt,
        valorParcela: vp,
        parcelasTotais: pt,
        parcelasPagas: pp,
        vencimentoDia: parseInt(vencimentoDia),
        status,
        recorrencia,
        observacoes: observacoes.trim() || undefined,
        criadoEm: new Date().toISOString(),
      })
      onFechar()
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onFechar} />
      <div className="relative w-full max-w-[430px] mx-auto bg-[var(--bg2)] rounded-t-[20px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 pt-4 pb-2 sticky top-0 bg-[var(--bg2)] border-b border-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--text)]">Nova Dívida</h2>
          <button onClick={onFechar} className="p-1.5 text-[var(--text3)] hover:text-[var(--text)]">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={e => void handleSubmit(e)} className="p-4 flex flex-col gap-4">
          <FormInput label="Nome" value={nome} onChange={e => setNome(e.target.value)} erro={erros.nome} placeholder="Ex: Nubank fatura" />
          <FormSelect
            label="Tipo"
            value={tipo}
            onChange={e => setTipo(e.target.value as TipoDivida)}
            options={TIPOS}
          />
          <FormSelect
            label="Origem"
            value={origem}
            onChange={e => setOrigem(e.target.value as OrigemFinanceira)}
            options={[{ value: 'PF', label: 'Pessoa Física' }, { value: 'PJ', label: 'Pessoa Jurídica' }]}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Valor da parcela (R$)"
              type="number"
              inputMode="decimal"
              value={valorParcela}
              onChange={e => setValorParcela(e.target.value)}
              erro={erros.valorParcela}
              placeholder="850,00"
            />
            <FormInput
              label="Valor total (R$)"
              type="number"
              inputMode="decimal"
              value={valorTotal}
              onChange={e => setValorTotal(e.target.value)}
              placeholder="Calc. auto."
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <FormInput
              label="Total parcelas"
              type="number"
              inputMode="numeric"
              value={parcelasTotais}
              onChange={e => setParcelasTotais(e.target.value)}
              erro={erros.parcelasTotais}
              placeholder="24"
            />
            <FormInput
              label="Já pagas"
              type="number"
              inputMode="numeric"
              value={parcelasPagas}
              onChange={e => setParcelasPagas(e.target.value)}
              placeholder="0"
            />
            <FormInput
              label="Dia venc."
              type="number"
              inputMode="numeric"
              value={vencimentoDia}
              onChange={e => setVencimentoDia(e.target.value)}
              erro={erros.vencimentoDia}
              placeholder="10"
            />
          </div>

          <FormSelect
            label="Recorrência"
            value={recorrencia}
            onChange={e => setRecorrencia(e.target.value as typeof recorrencia)}
            options={RECORRENCIAS}
          />

          {recorrencia !== 'nenhuma' && restantes > 0 && valorParcelaNum > 0 && (
            <div className="bg-[rgba(77,159,255,0.08)] border border-[rgba(77,159,255,0.2)] rounded-xl px-3 py-2.5">
              <p className="text-xs text-[var(--blue)] leading-relaxed">
                {recorrencia === 'fixa'
                  ? `Parcela de R$ ${valorParcelaNum.toFixed(2).replace('.', ',')} será lançada automaticamente todo mês. Total restante: ${restantes}x`
                  : `Você será lembrado de registrar o valor desta parcela todo mês. ${restantes} parcelas restantes.`}
              </p>
            </div>
          )}

          <FormSelect
            label="Status"
            value={status}
            onChange={e => setStatus(e.target.value as StatusDivida)}
            options={STATUS}
          />
          <FormInput
            label="Observações (opcional)"
            value={observacoes}
            onChange={e => setObservacoes(e.target.value)}
            placeholder="Anotações..."
          />
          <button
            type="submit"
            disabled={salvando}
            className="w-full py-3.5 rounded-xl bg-[var(--green)] text-[#0a0a0f] font-semibold text-sm disabled:opacity-60 transition-opacity"
          >
            {salvando ? 'Salvando...' : 'Salvar dívida'}
          </button>
        </form>
      </div>
    </div>
  )
}
