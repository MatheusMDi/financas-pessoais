import { ThemeToggle } from '../ui/ThemeToggle'

interface HeaderProps {
  titulo: string
  acao?: React.ReactNode
}

export function Header({ titulo, acao }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 pt-4 pb-2">
      <h1 className="text-lg font-semibold text-[var(--text)]">{titulo}</h1>
      <div className="flex items-center gap-2">
        {acao}
        <ThemeToggle />
      </div>
    </header>
  )
}
