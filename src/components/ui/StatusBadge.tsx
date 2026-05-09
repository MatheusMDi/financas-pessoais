interface StatusBadgeProps {
  label: string
  cor: 'green' | 'red' | 'yellow' | 'blue' | 'purple'
}

const corMap: Record<string, string> = {
  green: 'bg-[rgba(0,229,160,0.12)] text-[var(--green)]',
  red: 'bg-[rgba(255,77,106,0.12)] text-[var(--red)]',
  yellow: 'bg-[rgba(255,209,102,0.12)] text-[var(--yellow)]',
  blue: 'bg-[rgba(77,159,255,0.12)] text-[var(--blue)]',
  purple: 'bg-[rgba(176,136,255,0.12)] text-[var(--purple)]',
}

export function StatusBadge({ label, cor }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${corMap[cor]}`}>
      {label}
    </span>
  )
}
