import { useState } from 'react'
import { X } from 'lucide-react'
import { FormInput } from '../ui/FormInput'
import { FormSelect } from '../ui/FormSelect'
import type { Cartao, StatusCartao } from '../../db/types'

interface CartaoFormProps {
  onSalvar: (cartao: Omit<Cartao, 'id'>) => Promise<void>
  onFechar: () => void
}

export function CartaoForm({ onSalvar, onFechar }: CartaoFormProps) {
  const [nome, setNome] = useState('')
  const [banco, setBanco] = useState('')
  const [bandeira, setBandeira] = useState<Cartao['bandeira']>('mastercard')
  const [limiteTotal, setLimiteTotal] = useState('')
  const [faturaAtual, setFaturaAtual] = useState('')
  const [diaFechamento, setDiaFechamento] = useState('')
  const [diaVencimento, setDiaVencimento] = useState('')
  const [status, setStatus] = useState<StatusCartao>('ok')
  const [salvando, setSalvando] = useState(false)
  const [erros, setErros] = useState<Record<string, string>>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const novosErros: Record<string, string> = {}
    if (!nome.trim()) novosErros.nome = 'Nome obrigatório'
    if (!banco.trim()) novosErros.banco = 'Banco obrigatório'
    if (!limiteTotal || isNaN(parseFloat(limiteTotal))) novosErros.limiteTotal = 'Limite inválido'
    if (!diaFechamento || isNaN(parseInt(diaFechamento))) novosErros.diaFechamento = 'Dia inválido'
    if (!diaVencimento || isNaN(parseInt(diaVencimento))) novosErros.diaVencimento = 'Dia inválido'

    if (Object.keys(novosErros).length > 0) { setErros(novosErros); return }

    setSalvando(true)
    try {
      const lt = parseFloat(limiteTotal)
      const fa = parseFloat(faturaAtual) || 0
      await onSalvar({
        nome: nome.trim(),
        banco: banco.trim(),
        bandeira,
        limiteTotal: lt,
        faturaAtual: fa,
        limiteDisponivel: lt - fa,
        diaFechamento: parseInt(diaFechamento),
        diaVencimento: parseInt(diaVencimento),
        status,
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
          <h2 className="text-base font-semibold text-[var(--text)]">Novo Cartão</h2>
          <button onClick={onFechar} className="p-1.5 text-[var(--text3)] hover:text-[var(--text)]"><X size={20} /></button>
        </div>
        <form onSubmit={e => void handleSubmit(e)} className="p-4 flex flex-col gap-4">
          <FormInput label="Nome do cartão" value={nome} onChange={e => setNome(e.target.value)} erro={erros.nome} placeholder="Ex: Nubank Ultravioleta" />
          <FormInput label="Banco" value={banco} onChange={e => setBanco(e.target.value)} erro={erros.banco} placeholder="Ex: Nubank" />
          <FormSelect
            label="Bandeira"
            value={bandeira}
            onChange={e => setBandeira(e.target.value as Cartao['bandeira'])}
            options={[
              { value: 'mastercard', label: 'Mastercard' },
              { value: 'visa', label: 'Visa' },
              { value: 'elo', label: 'Elo' },
              { value: 'amex', label: 'Amex' },
            ]}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Limite total (R$)" type="number" inputMode="decimal" value={limiteTotal} onChange={e => setLimiteTotal(e.target.value)} erro={erros.limiteTotal} placeholder="5000" />
            <FormInput label="Fatura atual (R$)" type="number" inputMode="decimal" value={faturaAtual} onChange={e => setFaturaAtual(e.target.value)} placeholder="0" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Dia fechamento" type="number" inputMode="numeric" value={diaFechamento} onChange={e => setDiaFechamento(e.target.value)} erro={erros.diaFechamento} placeholder="3" />
            <FormInput label="Dia vencimento" type="number" inputMode="numeric" value={diaVencimento} onChange={e => setDiaVencimento(e.target.value)} erro={erros.diaVencimento} placeholder="10" />
          </div>
          <FormSelect
            label="Status"
            value={status}
            onChange={e => setStatus(e.target.value as StatusCartao)}
            options={[
              { value: 'ok', label: 'OK' },
              { value: 'atencao', label: 'Atenção' },
              { value: 'critico', label: 'Crítico' },
              { value: 'bloqueado', label: 'Bloqueado' },
            ]}
          />
          <button type="submit" disabled={salvando} className="w-full py-3.5 rounded-xl bg-[var(--green)] text-[#0a0a0f] font-semibold text-sm disabled:opacity-60">
            {salvando ? 'Salvando...' : 'Salvar cartão'}
          </button>
        </form>
      </div>
    </div>
  )
}
