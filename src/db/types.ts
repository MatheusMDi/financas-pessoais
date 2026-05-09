export type StatusDivida = 'em_aberto' | 'atencao' | 'quitado'
export type OrigemFinanceira = 'PF' | 'PJ'
export type TipoDivida = 'parcela_fixa' | 'cartao' | 'emprestimo_pf' | 'emprestimo_pj' | 'outro'
export type StatusCartao = 'ok' | 'atencao' | 'critico' | 'bloqueado'
export type TipoImposto = 'das_mei' | 'das_me' | 'irpf' | 'pro_labore' | 'iss' | 'cofins' | 'pis' | 'inss_pj' | 'outros'
export type StatusImposto = 'a_pagar' | 'pago' | 'atrasado' | 'provisionado'
export type CategoriaGasto = 'tech' | 'casa' | 'saude_esporte' | 'transporte' | 'educacao' | 'pj_trabalho' | 'lazer' | 'pessoal'
export type PrioridadeGasto = 'urgente' | 'importante' | 'desejo'
export type StatusGasto = 'planejado' | 'juntando' | 'comprado' | 'cancelado'
export type TipoMeta = 'reserva_emergencia' | 'compra_planejada' | 'quitar_divida' | 'investimento' | 'outro'
export type StatusMeta = 'em_andamento' | 'concluida' | 'pausada' | 'cancelada'

export interface Divida {
  id?: number
  nome: string
  tipo: TipoDivida
  origem: OrigemFinanceira
  valorTotal: number
  valorParcela: number
  parcelasTotais: number
  parcelasPagas: number
  vencimentoDia: number
  status: StatusDivida
  observacoes?: string
  criadoEm: string
}

export interface Cartao {
  id?: number
  nome: string
  banco: string
  bandeira: 'visa' | 'mastercard' | 'elo' | 'amex'
  limiteTotal: number
  faturaAtual: number
  limiteDisponivel: number
  diaFechamento: number
  diaVencimento: number
  status: StatusCartao
  observacoes?: string
}

export interface Imposto {
  id?: number
  descricao: string
  tipo: TipoImposto
  competencia: string
  valor: number
  vencimento: string
  status: StatusImposto
  provisionado: number
  observacoes?: string
}

export interface GastoFuturo {
  id?: number
  item: string
  categoria: CategoriaGasto
  valorEstimado: number
  mesAlvo: string
  prioridade: PrioridadeGasto
  status: StatusGasto
  parcelado: boolean
  parcelas?: number
  impactoMargem?: number
  observacoes?: string
}

export interface Meta {
  id?: number
  nome: string
  tipo: TipoMeta
  valorAlvo: number
  valorAcumulado: number
  prazo: string
  status: StatusMeta
  prioridade: 'alta' | 'media' | 'baixa'
  observacoes?: string
}

export interface RendaMensal {
  id?: number
  mesAno: string
  rendaPF: number
  rendaPJ: number
  totalLiquido: number
  totalComprometido: number
  margemReal: number
  percentualComprometido: number
  observacoes?: string
}

export interface Configuracao {
  id?: number
  chave: string
  valor: string
}
