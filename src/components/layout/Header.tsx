import { ThemeToggle } from '../ui/ThemeToggle'

interface HeaderProps {
  titulo: string
  acao?: React.ReactNode
  subtitulo?: string
}

export function Header({ titulo, acao, subtitulo }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 pt-4 pb-3">
      <div>
        <h1 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}>
          {titulo}
        </h1>
        {subtitulo && (
          <p className="text-[11px] text-[var(--text3)] mt-0.5 font-medium">{subtitulo}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {acao}
        <ThemeToggle />
      </div>
    </header>
  )
}
