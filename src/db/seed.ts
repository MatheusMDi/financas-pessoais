import { db } from './database'
import type { Categoria, Subcategoria, Conta } from './types'

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
    valorAlvo: 24000,
    valorAcumulado: 0,
    prazo: '2027-12-31',
    status: 'em_andamento',
    prioridade: 'alta',
    observacoes: 'Meta: 3 meses de despesas. Conta: Reserva Emergência (separada da conta principal).',
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
    recorrencia: 'variavel',
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
    recorrencia: 'fixa',
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

  await db.configuracoes.add({ chave: 'saldoAtual', valor: '1850' })
  await db.configuracoes.add({ chave: 'tema', valor: 'dark' })
  await db.configuracoes.add({ chave: 'nomeUsuario', valor: 'Matheus — MD DataOps' })
  await db.configuracoes.add({ chave: 'rendaMensal', valor: '8000' })
  await db.configuracoes.add({ chave: 'diaRecebimento', valor: '5' })
  await db.configuracoes.add({ chave: 'mesesReservaAlvo', valor: '3' })
  await db.configuracoes.add({ chave: 'percentualMaxComprometido', valor: '70' })
  await db.configuracoes.add({ chave: 'alertaOrcamentoPct', valor: '80' })
  await db.configuracoes.add({ chave: 'diasAlertaVencimento', valor: '7' })

  const categoriasPadrao: Omit<Categoria, 'id'>[] = [
    { nome: 'Alimentação',   icone: '🍽️',  cor: '#FF6B6B', tipo: 'gasto', orcamentoMensal: 600,  ordem: 1,  padrao: true },
    { nome: 'Transporte',    icone: '🚗',   cor: '#4ECDC4', tipo: 'gasto', orcamentoMensal: 400,  ordem: 2,  padrao: true },
    { nome: 'Moradia',       icone: '🏠',   cor: '#45B7D1', tipo: 'gasto', orcamentoMensal: 0,    ordem: 3,  padrao: true },
    { nome: 'Saúde',         icone: '💊',   cor: '#96CEB4', tipo: 'gasto', orcamentoMensal: 300,  ordem: 4,  padrao: true },
    { nome: 'CrossFit',      icone: '🏋️',  cor: '#00E5A0', tipo: 'gasto', orcamentoMensal: 400,  ordem: 5,  padrao: true },
    { nome: 'Lazer',         icone: '🎮',   cor: '#B088FF', tipo: 'gasto', orcamentoMensal: 300,  ordem: 6,  padrao: true },
    { nome: 'Tech',          icone: '💻',   cor: '#4D9FFF', tipo: 'gasto', orcamentoMensal: 0,    ordem: 7,  padrao: true },
    { nome: 'Compras',       icone: '🛒',   cor: '#FFD166', tipo: 'gasto', orcamentoMensal: 400,  ordem: 8,  padrao: true },
    { nome: 'Educação',      icone: '📚',   cor: '#F7DC6F', tipo: 'gasto', orcamentoMensal: 0,    ordem: 9,  padrao: true },
    { nome: 'PJ / Trabalho', icone: '💼',   cor: '#85C1E9', tipo: 'gasto', orcamentoMensal: 0,    ordem: 10, padrao: true },
    { nome: 'Receita PJ',    icone: '💵',   cor: '#00E5A0', tipo: 'receita', orcamentoMensal: 0,  ordem: 11, padrao: true },
    { nome: 'Outros',        icone: '📦',   cor: '#8888AA', tipo: 'ambos', orcamentoMensal: 0,    ordem: 12, padrao: true },
  ]

  const catIds = await db.categorias.bulkAdd(categoriasPadrao, { allKeys: true }) as number[]

  const subCats: Omit<import('./types').Subcategoria, 'id'>[] = [
    { categoriaId: catIds[0], nome: 'iFood / Delivery', icone: '📱', ordem: 1 },
    { categoriaId: catIds[0], nome: 'Restaurante',      icone: '🍴', ordem: 2 },
    { categoriaId: catIds[0], nome: 'Mercado',          icone: '🛒', ordem: 3 },
    { categoriaId: catIds[0], nome: 'Lanche / Café',    icone: '☕', ordem: 4 },
    { categoriaId: catIds[1], nome: 'Combustível',      icone: '⛽', ordem: 1 },
    { categoriaId: catIds[1], nome: 'Uber / 99',        icone: '🚕', ordem: 2 },
    { categoriaId: catIds[1], nome: 'Manutenção',       icone: '🔧', ordem: 3 },
    { categoriaId: catIds[4], nome: 'Mensalidade box',  icone: '🏆', ordem: 1 },
    { categoriaId: catIds[4], nome: 'Suplementação',    icone: '💊', ordem: 2 },
    { categoriaId: catIds[4], nome: 'Equipamento',      icone: '🎽', ordem: 3 },
    { categoriaId: catIds[4], nome: 'Competição',       icone: '🥇', ordem: 4 },
    { categoriaId: catIds[7], nome: 'Amazon / Shopee',  icone: '📦', ordem: 1 },
    { categoriaId: catIds[7], nome: 'Roupas',           icone: '👕', ordem: 2 },
    { categoriaId: catIds[7], nome: 'Eletrônicos',      icone: '📱', ordem: 3 },
  ]
  await db.subcategorias.bulkAdd(subCats)

  const contasPadrao: Omit<Conta, 'id'>[] = [
    { nome: 'Conta Principal PJ', tipo: 'corrente', banco: 'Principal', saldoInicial: 1850, cor: '#00E5A0', icone: '💼', ativa: true },
    { nome: 'Reserva Emergência',  tipo: 'poupanca', banco: '',          saldoInicial: 0,    cor: '#4D9FFF', icone: '🛡️', ativa: true },
  ]
  await db.contas.bulkAdd(contasPadrao)
}

export async function seedCategorias(): Promise<void> {
  const count = await db.categorias.count()
  if (count > 0) return

  const categoriasPadrao: Omit<Categoria, 'id'>[] = [
    { nome: 'Alimentação',   icone: '🍽️',  cor: '#FF6B6B', tipo: 'gasto', orcamentoMensal: 600,  ordem: 1,  padrao: true },
    { nome: 'Transporte',    icone: '🚗',   cor: '#4ECDC4', tipo: 'gasto', orcamentoMensal: 400,  ordem: 2,  padrao: true },
    { nome: 'Moradia',       icone: '🏠',   cor: '#45B7D1', tipo: 'gasto', orcamentoMensal: 0,    ordem: 3,  padrao: true },
    { nome: 'Saúde',         icone: '💊',   cor: '#96CEB4', tipo: 'gasto', orcamentoMensal: 300,  ordem: 4,  padrao: true },
    { nome: 'CrossFit',      icone: '🏋️',  cor: '#00E5A0', tipo: 'gasto', orcamentoMensal: 400,  ordem: 5,  padrao: true },
    { nome: 'Lazer',         icone: '🎮',   cor: '#B088FF', tipo: 'gasto', orcamentoMensal: 300,  ordem: 6,  padrao: true },
    { nome: 'Tech',          icone: '💻',   cor: '#4D9FFF', tipo: 'gasto', orcamentoMensal: 0,    ordem: 7,  padrao: true },
    { nome: 'Compras',       icone: '🛒',   cor: '#FFD166', tipo: 'gasto', orcamentoMensal: 400,  ordem: 8,  padrao: true },
    { nome: 'Educação',      icone: '📚',   cor: '#F7DC6F', tipo: 'gasto', orcamentoMensal: 0,    ordem: 9,  padrao: true },
    { nome: 'PJ / Trabalho', icone: '💼',   cor: '#85C1E9', tipo: 'gasto', orcamentoMensal: 0,    ordem: 10, padrao: true },
    { nome: 'Receita PJ',    icone: '💵',   cor: '#00E5A0', tipo: 'receita', orcamentoMensal: 0,  ordem: 11, padrao: true },
    { nome: 'Outros',        icone: '📦',   cor: '#8888AA', tipo: 'ambos', orcamentoMensal: 0,    ordem: 12, padrao: true },
  ]
  const catIds = await db.categorias.bulkAdd(categoriasPadrao, { allKeys: true }) as number[]

  const subCats: Omit<Subcategoria, 'id'>[] = [
    { categoriaId: catIds[0], nome: 'iFood / Delivery', icone: '📱', ordem: 1 },
    { categoriaId: catIds[0], nome: 'Restaurante',      icone: '🍴', ordem: 2 },
    { categoriaId: catIds[0], nome: 'Mercado',          icone: '🛒', ordem: 3 },
    { categoriaId: catIds[0], nome: 'Lanche / Café',    icone: '☕', ordem: 4 },
    { categoriaId: catIds[1], nome: 'Combustível',      icone: '⛽', ordem: 1 },
    { categoriaId: catIds[1], nome: 'Uber / 99',        icone: '🚕', ordem: 2 },
    { categoriaId: catIds[1], nome: 'Manutenção',       icone: '🔧', ordem: 3 },
    { categoriaId: catIds[4], nome: 'Mensalidade box',  icone: '🏆', ordem: 1 },
    { categoriaId: catIds[4], nome: 'Suplementação',    icone: '💊', ordem: 2 },
    { categoriaId: catIds[4], nome: 'Equipamento',      icone: '🎽', ordem: 3 },
    { categoriaId: catIds[4], nome: 'Competição',       icone: '🥇', ordem: 4 },
    { categoriaId: catIds[7], nome: 'Amazon / Shopee',  icone: '📦', ordem: 1 },
    { categoriaId: catIds[7], nome: 'Roupas',           icone: '👕', ordem: 2 },
    { categoriaId: catIds[7], nome: 'Eletrônicos',      icone: '📱', ordem: 3 },
  ]
  await db.subcategorias.bulkAdd(subCats)
}

export async function seedContas(): Promise<void> {
  const count = await db.contas.count()
  if (count > 0) return
  await db.contas.bulkAdd([
    { nome: 'Conta Principal PJ', tipo: 'corrente', banco: 'Principal', saldoInicial: 1850, cor: '#00E5A0', icone: '💼', ativa: true },
    { nome: 'Reserva Emergência',  tipo: 'poupanca', banco: '',          saldoInicial: 0,    cor: '#4D9FFF', icone: '🛡️', ativa: true },
  ])
}
