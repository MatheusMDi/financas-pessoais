import { useState } from 'react'
import { X } from 'lucide-react'
import { FormInput } from '../ui/FormInput'
import { FormSelect } from '../ui/FormSelect'
import type { Meta, TipoMeta } from '../../db/types'

interface MetaFormProps {
  onSalvar: (meta: Omit<Meta, 'id'>) => Promise<void>
  onFechar: () => void
}

const TIPOS: { value: TipoMeta; label: string }[] = [
  { value: 'reserva_emergencia', label: 'Reserva de emergência' },
  { value: 'compra_planejada', label: 'Compra planejada' },
  { value: 'quitar_divida', label: 'Quitar dívida' },
  { value: 'investimento', label: 'Investimento' },
  { value: 'outro', label: 'Outro' },
]

export function MetaForm({ onSalvar, onFechar }: MetaFormProps) {
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState<TipoMeta>('reserva_emergencia')
  const [valorAlvo, setValorAlvo] = useState('')
  const [valorAcumulado, setValorAcumulado] = useState('0')
  const [prazo, setPrazo] = useState('')
  const [prioridade, setPrioridade] = useState<Meta['prioridade']>('media')
  const [observacoes, setObservacoes] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erros, setErros] = useState<Record<string, string>>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const novosErros: Record<string, string> = {}
    if (!nome.trim()) novosErros.nome = 'Nome obrigatório'
    if (!valorAlvo || isNaN(parseFloat(valorAlvo))) novosErros.valorAlvo = 'Valor inválido'
    if (!prazo) novosErros.prazo = 'Prazo obrigatório'

    if (Object.keys(novosErros).length > 0) { setErros(novosErros); return }

    setSalvando(true)
    try {
      await onSalvar({
        nome: nome.trim(),
        tipo,
        valorAlvo: parseFloat(valorAlvo),
        valorAcumulado: parseFloat(valorAcumulado) || 0,
        prazo,
        status: 'em_andamento',
        prioridade,
        observacoes: observacoes.trim() || undefined,
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
          <h2 className="text-base font-semibold text-[var(--text)]">Nova Meta</h2>
          <button onClick={onFechar} className="p-1.5 text-[var(--text3)] hover:text-[var(--text)]"><X size={20} /></button>
        </div>
        <form onSubmit={e => void handleSubmit(e)} className="p-4 flex flex-col gap-4">
          <FormInput label="Nome da meta" value={nome} onChange={e => setNome(e.target.value)} erro={erros.nome} placeholder="Ex: Reserva de emergência" />
          <FormSelect label="Tipo" value={tipo} onChange={e => setTipo(e.target.value as TipoMeta)} options={TIPOS} />
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Valor alvo (R$)" type="number" inputMode="decimal" value={valorAlvo} onChange={e => setValorAlvo(e.target.value)} erro={erros.valorAlvo} placeholder="15000" />
            <FormInput label="Já acumulado (R$)" type="number" inputMode="decimal" value={valorAcumulado} onChange={e => setValorAcumulado(e.target.value)} placeholder="0" />
          </div>
          <FormInput label="Prazo" type="date" value={prazo} onChange={e => setPrazo(e.target.value)} erro={erros.prazo} />
          <FormSelect
            label="Prioridade"
            value={prioridade}
            onChange={e => setPrioridade(e.target.value as Meta['prioridade'])}
            options={[
              { value: 'alta', label: 'Alta' },
              { value: 'media', label: 'Média' },
              { value: 'baixa', label: 'Baixa' },
            ]}
          />
          <FormInput label="Observações (opcional)" value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Anotações..." />
          <button type="submit" disabled={salvando} className="w-full py-3.5 rounded-xl bg-[var(--green)] text-[#0a0a0f] font-semibold text-sm disabled:opacity-60">
            {salvando ? 'Salvando...' : 'Salvar meta'}
          </button>
        </form>
      </div>
    </div>
  )
}
