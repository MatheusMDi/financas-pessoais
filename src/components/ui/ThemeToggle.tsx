import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'

export function ThemeToggle() {
  const { tema, toggleTema } = useThemeStore()

  return (
    <button
      onClick={() => void toggleTema()}
      className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg3)] border border-[var(--border)] text-[var(--text2)] transition-all hover:text-[var(--text)]"
      aria-label="Alternar tema"
    >
      {tema === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
