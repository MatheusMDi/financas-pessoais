import { db } from './database'

export async function seedInitialData(): Promise<void> {
  const count = await db.rendaMensal.count()
  if (count > 0) return

  await db.rendaMensal.add({
    mesAno: '2026-05',
    rendaPF: 0,
    rendaPJ: 8000,
    totalLiquido: 8000,
    totalComprometido: 7000,
    margemReal: 1000,
    percentualComprometido: 87.5,
    observacoes: 'Renda base MEI',
  })

  await db.rendaMensal.add({
    mesAno: '2026-04',
    rendaPF: 0,
    rendaPJ: 7500,
    totalLiquido: 7500,
    totalComprometido: 6800,
    margemReal: 700,
    percentualComprometido: 90.7,
  })

  await db.rendaMensal.add({
    mesAno: '2026-03',
    rendaPF: 0,
    rendaPJ: 8200,
    totalLiquido: 8200,
    totalComprometido: 6500,
    margemReal: 1700,
    percentualComprometido: 79.3,
  })

  await db.metas.add({
    nome: 'ASUS ROG G16 — Entrada',
    tipo: 'compra_planejada',
    valorAlvo: 2400,
    valorAcumulado: 0,
    prazo: '2026-08-01',
    status: 'em_andamento',
    prioridade: 'alta',
    observacoes: 'R$800/mês × 3 meses. Restante: 10× ~R$1.010 no cartão.',
  })

  await db.metas.add({
    nome: 'Reserva de Emergência',
    tipo: 'reserva_emergencia',
    valorAlvo: 15000,
    valorAcumulado: 2000,
    prazo: '2027-01-01',
    status: 'em_andamento',
    prioridade: 'alta',
    observacoes: 'Meta de 6 meses de despesas',
  })

  await db.gastosFuturos.add({
    item: 'ASUS ROG Strix G16 — G615JMR',
    categoria: 'tech',
    valorEstimado: 12499,
    mesAlvo: 'Agosto 2026',
    prioridade: 'urgente',
    status: 'juntando',
    parcelado: true,
    parcelas: 10,
    impactoMargem: 1010,
    observacoes: 'Entrada de R$2.400 + 10x R$1.010',
  })

  await db.dividas.add({
    nome: 'Cartão Nubank',
    tipo: 'cartao',
    origem: 'PF',
    valorTotal: 3500,
    valorParcela: 3500,
    parcelasTotais: 1,
    parcelasPagas: 0,
    vencimentoDia: 10,
    status: 'em_aberto',
    criadoEm: new Date().toISOString(),
  })

  await db.dividas.add({
    nome: 'Empréstimo Caixa',
    tipo: 'emprestimo_pf',
    origem: 'PF',
    valorTotal: 12000,
    valorParcela: 850,
    parcelasTotais: 24,
    parcelasPagas: 10,
    vencimentoDia: 15,
    status: 'em_aberto',
    criadoEm: new Date().toISOString(),
  })

  await db.cartoes.add({
    nome: 'Nubank Ultravioleta',
    banco: 'Nubank',
    bandeira: 'mastercard',
    limiteTotal: 8000,
    faturaAtual: 3500,
    limiteDisponivel: 4500,
    diaFechamento: 3,
    diaVencimento: 10,
    status: 'atencao',
  })

  await db.cartoes.add({
    nome: 'Inter Black',
    banco: 'Banco Inter',
    bandeira: 'mastercard',
    limiteTotal: 5000,
    faturaAtual: 800,
    limiteDisponivel: 4200,
    diaFechamento: 20,
    diaVencimento: 27,
    status: 'ok',
  })

  await db.impostos.add({
    descricao: 'DAS MEI — Maio 2026',
    tipo: 'das_mei',
    competencia: 'Maio 2026',
    valor: 75.90,
    vencimento: '2026-05-20',
    status: 'a_pagar',
    provisionado: 75.90,
  })

  await db.impostos.add({
    descricao: 'IRPF — Maio 2026',
    tipo: 'irpf',
    competencia: 'Maio 2026',
    valor: 320,
    vencimento: '2026-05-31',
    status: 'provisionado',
    provisionado: 320,
  })

  await db.configuracoes.add({
    chave: 'saldoAtual',
    valor: '1850',
  })

  await db.configuracoes.add({
    chave: 'tema',
    valor: 'dark',
  })
}
