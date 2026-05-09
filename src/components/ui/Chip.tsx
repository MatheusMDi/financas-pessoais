interface ChipProps {
  label: string
  ativo?: boolean
  onClick?: () => void
}

export function Chip({ label, ativo = false, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
        ativo
          ? 'bg-[var(--blue)] text-white'
          : 'bg-[var(--bg3)] text-[var(--text2)] border border-[var(--border)]'
      }`}
    >
      {label}
    </button>
  )
}
