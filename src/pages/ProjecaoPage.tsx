import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, ReferenceLine, CartesianGrid, Legend,
} from 'recharts'
import {
  TrendingDown, TrendingUp, AlertTriangle, Calendar,
  DollarSign, ChevronDown, ChevronRight, Info,
} from 'lucide-react'
import { useProjection } from '../hooks/useProjection'
import { Header } from '../components/layout/Header'
import { formatBRL, formatBRLCompact } from '../utils/formatCurrency'

// ─── Formatadores locais ──────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: '2-digit',
  })
}

function fmtDateShort(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short',
  })
}

function fmtMes(mesAno: string) {
  const [y, m] = mesAno.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({
  icon: Icon, label, valor, sub, cor = 'var(--text)',
}: {
  icon: React.ElementType
  label: string
  valor: string
  sub?: string
  cor?: string
}) {
  return (
    <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <Icon size={13} style={{ color: cor }} />
        <p className="text-[10px] text-[var(--text3)] uppercase tracking-wide">{label}</p>
      </div>
      <p className="font-mono text-base font-bold leading-none" style={{ color: cor }}>{valor}</p>
      {sub && <p className="text-[10px] text-[var(--text3)] leading-tight">{sub}</p>}
    </div>
  )
}

// ─── Tooltip customizado para os gráficos ────────────────────────────────────

function TooltipCustom({ active, payload, label }: {
  active?: boolean
  payload?: { value: number; name: string; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-[var(--text3)] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-mono font-semibold">
          {p.name}: {formatBRL(p.value)}
        </p>
      ))}
    </div>
  )
}

// ─── Página Principal ─────────────────────────────────────────────────────────

export function ProjecaoPage({ embedded = false }: { embedded?: boolean }) {
  const projecao = useProjection()
  const [dataSim, setDataSim] = useState('')
  const [mostrarTodosEventos, setMostrarTodosEventos] = useState(false)
  const [tabGrafico, setTabGrafico] = useState<'linha' | 'barras'>('linha')

  // Próximos 30 dias de eventos nomeados
  const proximosEventos = useMemo(() => {
    if (!projecao) return []
    const hoje = new Date().toISOString().slice(0, 10)
    const limite = new Date()
    limite.setDate(limite.getDate() + 30)
    const limiteISO = limite.toISOString().slice(0, 10)
    const eventos: { data: string; descricao: string; valor: number; categoria: string }[] = []
    for (const dia of projecao.diasProjecao) {
      if (dia.data > limiteISO) break
      if (dia.data < hoje) continue
      for (const ev of dia.eventos) {
        eventos.push({ data: dia.data, descricao: ev.descricao, valor: ev.valor, categoria: ev.categoria })
      }
    }
    return eventos
  }, [projecao])

  // Resultado do simulador
  const saldoSimulado = useMemo(() => {
    if (!dataSim || !projecao) return null
    return projecao.getBalanceAt(dataSim)
  }, [dataSim, projecao])

  if (!projecao) {
    return (
      <div className="flex flex-col flex-1">
        {!embedded && <Header titulo="Projeção Financeira" />}
        <div className="flex items-center justify-center flex-1 py-16">
          <p className="text-sm text-[var(--text3)]">Calculando projeção...</p>
        </div>
      </div>
    )
  }

  const { kpis, mesesProjecao, dadosGraficoLinha, horizonte, snapshot30, snapshot60, snapshot90 } = projecao

  const temAlerta = kpis.mesesNegativos.length > 0 || kpis.menorSaldo < 0

  // Dados para gráfico de barras mensais
  const dadosBarras = mesesProjecao.slice(0, 12).map(m => ({
    label: m.label,
    Entradas: m.entradas,
    Saídas: m.saidas,
    Líquido: m.liquido,
  }))

  return (
    <div className="flex flex-col flex-1 pb-24">
      {!embedded && <Header titulo="Projeção Financeira" />}

      {/* Alerta crítico */}
      {temAlerta && (
        <div className="mx-4 mb-3 bg-[rgba(255,77,106,0.08)] border border-[rgba(255,77,106,0.3)] rounded-xl px-4 py-3 flex items-start gap-3">
          <AlertTriangle size={16} className="text-[var(--red)] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[var(--red)]">Atenção: saldo negativo previsto</p>
            <p className="text-xs text-[var(--text2)] mt-0.5 leading-relaxed">
              {kpis.mesesNegativos.length > 0
                ? `Saldo negativo em: ${kpis.mesesNegativos.map(m => fmtMes(m)).join(', ')}`
                : `Menor saldo: ${formatBRL(kpis.menorSaldo)} em ${fmtDate(kpis.dataMenorSaldo)}`}
            </p>
          </div>
        </div>
      )}

      {/* Horizonte */}
      <div className="mx-4 mb-3">
        <p className="text-[10px] text-[var(--text3)] uppercase tracking-widest">
          Projeção: {fmtDate(horizonte.inicio)} → {fmtDate(horizonte.fim)}
        </p>
      </div>

      {/* KPIs — 2×2 */}
      <div className="px-4 grid grid-cols-2 gap-2.5 mb-4">
        <KPICard
          icon={TrendingUp}
          label="Saldo ao fim do horizonte"
          valor={formatBRL(kpis.saldoFinalHorizonte)}
          sub={`em ${fmtDate(kpis.dataFinalHorizonte)}`}
          cor={kpis.saldoFinalHorizonte >= 0 ? 'var(--green)' : 'var(--red)'}
        />
        <KPICard
          icon={TrendingDown}
          label="Menor saldo previsto"
          valor={formatBRL(kpis.menorSaldo)}
          sub={`em ${fmtDate(kpis.dataMenorSaldo)}`}
          cor={kpis.menorSaldo < 0 ? 'var(--red)' : 'var(--yellow)'}
        />
        <KPICard
          icon={DollarSign}
          label="Total em dívidas"
          valor={formatBRL(kpis.totalDividasHorizonte)}
          sub="no horizonte completo"
          cor="var(--text)"
        />
        <KPICard
          icon={Calendar}
          label="Próximo salário"
          valor={kpis.proximoSalarioData ? fmtDateShort(kpis.proximoSalarioData) : '—'}
          sub={kpis.proximoSalarioValor > 0 ? formatBRL(kpis.proximoSalarioValor) : 'Renda não configurada'}
          cor="var(--blue)"
        />
      </div>

      {/* Snapshots 30/60/90 dias */}
      <div className="mx-4 mb-4 bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-3">
        <p className="text-[10px] text-[var(--text3)] uppercase tracking-widest mb-2.5">Saldo projetado</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '30 dias', valor: snapshot30 },
            { label: '60 dias', valor: snapshot60 },
            { label: '90 dias', valor: snapshot90 },
          ].map(({ label, valor }) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <p className="text-[10px] text-[var(--text3)]">{label}</p>
              <p
                className="font-mono text-sm font-bold"
                style={{ color: valor >= 0 ? 'var(--green)' : 'var(--red)' }}
              >
                {formatBRLCompact(valor)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Abas dos gráficos */}
      <div className="mx-4 mb-2 flex gap-2">
        {(['linha', 'barras'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setTabGrafico(tab)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              tabGrafico === tab
                ? 'bg-[var(--blue)] text-white'
                : 'bg-[var(--bg3)] border border-[var(--border)] text-[var(--text2)]'
            }`}
          >
            {tab === 'linha' ? 'Saldo diário' : 'Mensal'}
          </button>
        ))}
      </div>

      {/* Gráfico de linha — saldo diário ao longo do horizonte */}
      {tabGrafico === 'linha' && (
        <div className="mx-4 mb-4 bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-xs font-medium text-[var(--text2)] mb-3">Evolução do saldo</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={dadosGraficoLinha} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tick={{ fill: 'var(--text3)', fontSize: 9 }}
                interval={Math.floor(dadosGraficoLinha.length / 5)}
              />
              <YAxis
                tickFormatter={v => formatBRLCompact(v as number)}
                tick={{ fill: 'var(--text3)', fontSize: 9 }}
              />
              <Tooltip
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs shadow-xl">
                      <p className="text-[var(--text3)] mb-1">{label}</p>
                      <p
                        className="font-mono font-bold"
                        style={{ color: (payload[0].value as number) >= 0 ? 'var(--green)' : 'var(--red)' }}
                      >
                        {formatBRL(payload[0].value as number)}
                      </p>
                    </div>
                  ) : null
                }
              />
              <ReferenceLine y={0} stroke="var(--red)" strokeDasharray="4 4" strokeWidth={1} />
              <Line
                type="monotone"
                dataKey="saldo"
                stroke="var(--blue)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'var(--blue)' }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-[var(--text3)] mt-1 text-center">
            Inclui média de gasto diário estimada pelo histórico
          </p>
        </div>
      )}

      {/* Gráfico de barras mensais */}
      {tabGrafico === 'barras' && (
        <div className="mx-4 mb-4 bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-xs font-medium text-[var(--text2)] mb-3">Entradas × Saídas por mês</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dadosBarras} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fill: 'var(--text3)', fontSize: 9 }} />
              <YAxis tickFormatter={v => formatBRLCompact(v as number)} tick={{ fill: 'var(--text3)', fontSize: 9 }} />
              <Tooltip content={<TooltipCustom />} />
              <Legend wrapperStyle={{ fontSize: 10, color: 'var(--text3)' }} />
              <Bar dataKey="Entradas" fill="var(--green)" opacity={0.85} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Saídas" fill="var(--red)" opacity={0.85} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabela resumo mensal */}
      <div className="mx-4 mb-4">
        <p className="text-[10px] text-[var(--text3)] uppercase tracking-widest mb-2">Resumo mensal</p>
        <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-4 px-3 py-2 border-b border-[var(--border)]">
            {['Mês', 'Entradas', 'Saídas', 'Saldo'].map(h => (
              <p key={h} className="text-[10px] text-[var(--text3)] font-medium">{h}</p>
            ))}
          </div>
          {mesesProjecao.slice(0, 12).map(mes => (
            <div
              key={mes.mesAno}
              className={`grid grid-cols-4 px-3 py-2.5 border-b border-[var(--border)] last:border-0 ${
                mes.temSaldoNegativo ? 'bg-[rgba(255,77,106,0.04)]' : ''
              }`}
            >
              <div className="flex items-center gap-1">
                {mes.temSaldoNegativo && <AlertTriangle size={10} className="text-[var(--red)]" />}
                <p className="text-xs text-[var(--text2)]">{mes.label}</p>
              </div>
              <p className="font-mono text-xs text-[var(--green)]">{formatBRLCompact(mes.entradas)}</p>
              <p className="font-mono text-xs text-[var(--red)]">{formatBRLCompact(mes.saidas)}</p>
              <p
                className="font-mono text-xs font-semibold"
                style={{ color: mes.saldoFimMes >= 0 ? 'var(--green)' : 'var(--red)' }}
              >
                {formatBRLCompact(mes.saldoFimMes)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Simulador "E se?" */}
      <div className="mx-4 mb-4 bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info size={14} className="text-[var(--blue)]" />
          <p className="text-sm font-semibold text-[var(--text)]">Simulador "E se?"</p>
        </div>
        <p className="text-xs text-[var(--text3)] mb-3">
          Qual será meu saldo em uma data específica?
        </p>
        <input
          type="date"
          value={dataSim}
          onChange={e => setDataSim(e.target.value)}
          min={new Date().toISOString().slice(0, 10)}
          max={horizonte.fim}
          className="w-full bg-[var(--bg)] border border-[var(--border2)] rounded-xl px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--blue)] mb-3"
        />
        {saldoSimulado !== null && dataSim && (
          <div className={`rounded-xl px-4 py-3 ${
            saldoSimulado >= 0
              ? 'bg-[rgba(0,229,160,0.08)] border border-[rgba(0,229,160,0.2)]'
              : 'bg-[rgba(255,77,106,0.08)] border border-[rgba(255,77,106,0.2)]'
          }`}>
            <p className="text-xs text-[var(--text3)] mb-0.5">
              Saldo projetado em {fmtDate(dataSim)}
            </p>
            <p
              className="font-mono text-2xl font-bold"
              style={{ color: saldoSimulado >= 0 ? 'var(--green)' : 'var(--red)' }}
            >
              {formatBRL(saldoSimulado)}
            </p>
            {/* Breakdown do mês da data simulada */}
            {(() => {
              const mes = dataSim.slice(0, 7)
              const dadosMes = projecao.mesesProjecao.find(m => m.mesAno === mes)
              if (!dadosMes) return null
              return (
                <div className="mt-2 pt-2 border-t border-[var(--border)] grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-[10px] text-[var(--text3)]">Entradas no mês</p>
                    <p className="font-mono text-xs font-semibold text-[var(--green)]">{formatBRL(dadosMes.entradas)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--text3)]">Saídas no mês</p>
                    <p className="font-mono text-xs font-semibold text-[var(--red)]">{formatBRL(dadosMes.saidas)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--text3)]">Líquido</p>
                    <p
                      className="font-mono text-xs font-semibold"
                      style={{ color: dadosMes.liquido >= 0 ? 'var(--green)' : 'var(--red)' }}
                    >
                      {formatBRL(dadosMes.liquido)}
                    </p>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* Próximos eventos (30 dias) */}
      {proximosEventos.length > 0 && (
        <div className="mx-4 mb-4">
          <p className="text-[10px] text-[var(--text3)] uppercase tracking-widest mb-2">
            Próximos 30 dias
          </p>
          <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl overflow-hidden">
            {(mostrarTodosEventos ? proximosEventos : proximosEventos.slice(0, 6)).map((ev, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--border)] last:border-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm shrink-0">
                    {ev.categoria === 'salario' ? '💰'
                      : ev.categoria === 'divida' ? '📦'
                      : ev.categoria === 'cartao' ? '💳'
                      : ev.categoria === 'imposto' ? '🧾'
                      : ev.categoria === 'meta' ? '🎯'
                      : '📋'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--text)] truncate">{ev.descricao}</p>
                    <p className="text-[10px] text-[var(--text3)]">{fmtDateShort(ev.data)}</p>
                  </div>
                </div>
                <p
                  className="font-mono text-xs font-semibold shrink-0 ml-2"
                  style={{ color: ev.valor >= 0 ? 'var(--green)' : 'var(--red)' }}
                >
                  {ev.valor >= 0 ? '+' : ''}{formatBRL(Math.abs(ev.valor))}
                </p>
              </div>
            ))}
            {proximosEventos.length > 6 && (
              <button
                onClick={() => setMostrarTodosEventos(v => !v)}
                className="flex items-center justify-center gap-1.5 w-full px-3 py-2.5 text-xs text-[var(--blue)]"
              >
                {mostrarTodosEventos ? (
                  <><ChevronDown size={13} className="rotate-180" /> Mostrar menos</>
                ) : (
                  <><ChevronRight size={13} /> +{proximosEventos.length - 6} eventos</>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Aviso de metodologia */}
      <div className="mx-4 mb-2 px-3 py-2.5 bg-[var(--bg3)] border border-[var(--border)] rounded-xl">
        <p className="text-[10px] text-[var(--text3)] leading-relaxed">
          ⚡ Projeção baseada em lançamentos cadastrados + média de gasto dos últimos 90 dias.
          Gastos variáveis futuros são estimados pela média histórica diária.
          Recalcula automaticamente a cada novo lançamento.
        </p>
      </div>
    </div>
  )
}
