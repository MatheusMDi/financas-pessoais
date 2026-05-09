import type { Divida, Cartao, Imposto, Meta, RendaMensal } from '../db/types'

export interface EventoFluxo {
  data: string
  descricao: string
  tipo: 'entrada' | 'saida' | 'meta' | 'hoje'
  valor: number
  saldoApos: number
  referencia?: string
  categoria?: string
}

export function calcularFluxo(params: {
  saldoAtual: number
  dividas: Divida[]
  cartoes: Cartao[]
  impostos: Imposto[]
  metas: Meta[]
  rendaMensal: RendaMensal[]
  mesesAFrente?: number
}): EventoFluxo[] {
  const { saldoAtual, dividas, cartoes, impostos, metas, rendaMensal, mesesAFrente = 3 } = params
  const eventos: Omit<EventoFluxo, 'saldoApos'>[] = []

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const todayISO = hoje.toISOString().slice(0, 10)

  eventos.push({
    data: todayISO,
    descricao: 'Saldo atual',
    tipo: 'hoje',
    valor: 0,
    referencia: 'hoje',
  })

  const dataFim = new Date(hoje)
  dataFim.setMonth(dataFim.getMonth() + mesesAFrente)

  // Renda mensal: no dia 1 de cada mês seguinte
  const ultimaRenda = rendaMensal.sort((a, b) => b.mesAno.localeCompare(a.mesAno))[0]
  if (ultimaRenda) {
    for (let m = 0; m <= mesesAFrente; m++) {
      const diaRenda = new Date(hoje.getFullYear(), hoje.getMonth() + m, 1)
      if (diaRenda > dataFim) break
      const isoRenda = diaRenda.toISOString().slice(0, 10)
      if (isoRenda > todayISO) {
        eventos.push({
          data: isoRenda,
          descricao: `Renda — ${diaRenda.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
          tipo: 'entrada',
          valor: ultimaRenda.totalLiquido,
          referencia: 'rendaMensal',
          categoria: 'renda',
        })
      }
    }
  }

  // Dívidas em aberto ou atenção
  for (const divida of dividas) {
    if (divida.status === 'quitado') continue
    const parcelasRestantes = divida.parcelasTotais - divida.parcelasPagas
    if (parcelasRestantes <= 0) continue

    let parcProcessadas = 0
    for (let m = 0; m <= mesesAFrente + 1 && parcProcessadas < parcelasRestantes; m++) {
      const dataVenc = new Date(hoje.getFullYear(), hoje.getMonth() + m, divida.vencimentoDia)
      if (dataVenc > dataFim) break
      const isoVenc = dataVenc.toISOString().slice(0, 10)
      if (isoVenc >= todayISO) {
        eventos.push({
          data: isoVenc,
          descricao: `${divida.nome} (${divida.parcelasPagas + parcProcessadas + 1}/${divida.parcelasTotais})`,
          tipo: 'saida',
          valor: -divida.valorParcela,
          referencia: divida.nome,
          categoria: divida.tipo,
        })
        parcProcessadas++
      }
    }
  }

  // Cartões: fatura no dia de vencimento
  for (const cartao of cartoes) {
    if (cartao.faturaAtual <= 0) continue
    for (let m = 0; m <= mesesAFrente; m++) {
      const dataVenc = new Date(hoje.getFullYear(), hoje.getMonth() + m, cartao.diaVencimento)
      if (dataVenc > dataFim) break
      const isoVenc = dataVenc.toISOString().slice(0, 10)
      if (isoVenc >= todayISO && m === 0) {
        eventos.push({
          data: isoVenc,
          descricao: `Fatura ${cartao.nome}`,
          tipo: 'saida',
          valor: -cartao.faturaAtual,
          referencia: cartao.nome,
          categoria: 'cartao',
        })
      }
    }
  }

  // Impostos a pagar ou provisionados
  for (const imposto of impostos) {
    if (imposto.status === 'pago') continue
    const dataVenc = new Date(imposto.vencimento + 'T00:00:00')
    if (dataVenc > dataFim) continue
    const isoVenc = dataVenc.toISOString().slice(0, 10)
    if (isoVenc >= todayISO) {
      eventos.push({
        data: isoVenc,
        descricao: imposto.descricao,
        tipo: 'saida',
        valor: -imposto.valor,
        referencia: imposto.tipo,
        categoria: 'imposto',
      })
    }
  }

  // Metas em andamento: aporte mensal calculado
  for (const meta of metas) {
    if (meta.status !== 'em_andamento') continue
    const valorRestante = meta.valorAlvo - meta.valorAcumulado
    if (valorRestante <= 0) continue

    const prazo = new Date(meta.prazo + 'T00:00:00')
    const mesesRestantes = Math.max(
      1,
      (prazo.getFullYear() - hoje.getFullYear()) * 12 + prazo.getMonth() - hoje.getMonth()
    )
    const aporteMensal = valorRestante / mesesRestantes

    for (let m = 1; m <= Math.min(mesesAFrente, mesesRestantes); m++) {
      const dataAporte = new Date(hoje.getFullYear(), hoje.getMonth() + m, 5)
      if (dataAporte > dataFim) break
      const isoAporte = dataAporte.toISOString().slice(0, 10)
      eventos.push({
        data: isoAporte,
        descricao: `Aporte — ${meta.nome}`,
        tipo: 'meta',
        valor: -aporteMensal,
        referencia: meta.nome,
        categoria: meta.tipo,
      })
    }
  }

  // Ordena por data
  eventos.sort((a, b) => {
    if (a.data !== b.data) return a.data.localeCompare(b.data)
    if (a.tipo === 'hoje') return -1
    if (b.tipo === 'hoje') return 1
    if (a.tipo === 'entrada') return -1
    if (b.tipo === 'entrada') return 1
    return 0
  })

  // Calcula saldo acumulativo
  let saldo = saldoAtual
  return eventos.map(evento => {
    saldo += evento.valor
    return { ...evento, saldoApos: saldo }
  })
}
