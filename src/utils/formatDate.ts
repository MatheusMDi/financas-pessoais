export function formatDateBR(isoDate: string): string {
  const date = new Date(isoDate + (isoDate.length === 10 ? 'T00:00:00' : ''))
  return date.toLocaleDateString('pt-BR')
}

export function formatDateShort(isoDate: string): string {
  const date = new Date(isoDate + (isoDate.length === 10 ? 'T00:00:00' : ''))
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function formatMonthYear(mesAno: string): string {
  const [year, month] = mesAno.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function daysUntil(isoDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(isoDate + 'T00:00:00')
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function diasUteisRestantesNoMes(): number {
  const hoje = new Date()
  const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
  let count = 0
  for (let d = hoje.getDate(); d <= ultimoDia.getDate(); d++) {
    const dia = new Date(hoje.getFullYear(), hoje.getMonth(), d)
    const dow = dia.getDay()
    if (dow !== 0 && dow !== 6) count++
  }
  return count
}
