interface ProgressBarProps {
  valor: number
  total: number
  cor?: 'green' | 'red' | 'yellow' | 'blue' | 'purple'
  altura?: number
}

export function ProgressBar({ valor, total, cor = 'green', altura = 6 }: ProgressBarProps) {
  const pct = total > 0 ? Math.min(100, (valor / total) * 100) : 0

  const corMap = {
    green: 'bg-[var(--green)]',
    red: 'bg-[var(--red)]',
    yellow: 'bg-[var(--yellow)]',
    blue: 'bg-[var(--blue)]',
    purple: 'bg-[var(--purple)]',
  }

  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height: altura, backgroundColor: 'var(--border2)' }}>
      <div
        className={`h-full rounded-full transition-all duration-300 ${corMap[cor]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
