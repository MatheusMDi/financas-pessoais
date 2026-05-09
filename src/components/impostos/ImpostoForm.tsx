import { useState } from 'react'
import { X } from 'lucide-react'
import { FormInput } from '../ui/FormInput'
import { FormSelect } from '../ui/FormSelect'
import type { Imposto, TipoImposto, StatusImposto } from '../../db/types'

interface ImpostoFormProps {
  onSalvar: (imposto: Omit<Imposto, 'id'>) => Promise<void>
  onFechar: () => void
}

const TIPOS: { value: TipoImposto; label: string }[] = [
  { value: 'das_mei', label: 'DAS MEI' },
  { value: 'das_me', label: 'DAS ME' },
  { value: 'irpf', label: 'IRPF' },
  { value: 'pro_labore', label: 'Pró-labore' },
  { value: 'iss', label: 'ISS' },
  { value: 'cofins', label: 'COFINS' },
  { value: 'pis', label: 'PIS' },
  { value: 'inss_pj', label: 'INSS PJ' },
  { value: 'outros', label: 'Outros' },
]

const STATUS: { value: StatusImposto; label: string }[] = [
  { value: 'a_pagar', label: 'A pagar' },
  { value: 'provisionado', label: 'Provisionado' },
  { value: 'pago', label: 'Pago' },
  { value: 'atrasado', label: 'Atrasado' },
]

export function ImpostoForm({ onSalvar, onFechar }: ImpostoFormProps) {
  const [descricao, setDescricao] = useState('')
  const [tipo, setTipo] = useState<TipoImposto>('das_mei')
  const [competencia, setCompetencia] = useState('')
  const [valor, setValor] = useState('')
  const [vencimento, setVencimento] = useState('')
  const [status, setStatus] = useState<StatusImposto>('a_pagar')
  const [provisionado, setProvisionado] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erros, setErros] = useState<Record<string, string>>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const novosErros: Record<string, string> = {}
    if (!descricao.trim()) novosErros.descricao = 'Descrição obrigatória'
    if (!valor || isNaN(parseFloat(valor))) novosErros.valor = 'Valor inválido'
    if (!vencimento) novosErros.vencimento = 'Vencimento obrigatório'

    if (Object.keys(novosErros).length > 0) { setErros(novosErros); return }

    setSalvando(true)
    try {
      await onSalvar({
        descricao: descricao.trim(),
        tipo,
        competencia: competencia.trim() || '',
        valor: parseFloat(valor),
        vencimento,
        status,
        provisionado: parseFloat(provisionado) || 0,
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
          <h2 className="text-base font-semibold text-[var(--text)]">Novo Imposto</h2>
          <button onClick={onFechar} className="p-1.5 text-[var(--text3)] hover:text-[var(--text)]"><X size={20} /></button>
        </div>
        <form onSubmit={e => void handleSubmit(e)} className="p-4 flex flex-col gap-4">
          <FormInput label="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} erro={erros.descricao} placeholder="Ex: DAS MEI — Maio 2026" />
          <FormSelect label="Tipo" value={tipo} onChange={e => setTipo(e.target.value as TipoImposto)} options={TIPOS} />
          <FormInput label="Competência" value={competencia} onChange={e => setCompetencia(e.target.value)} placeholder="Maio 2026" />
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Valor (R$)" type="number" inputMode="decimal" value={valor} onChange={e => setValor(e.target.value)} erro={erros.valor} placeholder="75,90" />
            <FormInput label="Provisionado (R$)" type="number" inputMode="decimal" value={provisionado} onChange={e => setProvisionado(e.target.value)} placeholder="0" />
          </div>
          <FormInput label="Vencimento" type="date" value={vencimento} onChange={e => setVencimento(e.target.value)} erro={erros.vencimento} />
          <FormSelect label="Status" value={status} onChange={e => setStatus(e.target.value as StatusImposto)} options={STATUS} />
          <button type="submit" disabled={salvando} className="w-full py-3.5 rounded-xl bg-[var(--green)] text-[#0a0a0f] font-semibold text-sm disabled:opacity-60">
            {salvando ? 'Salvando...' : 'Salvar imposto'}
          </button>
        </form>
      </div>
    </div>
  )
}
