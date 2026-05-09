import { useState } from 'react'
import { Download } from 'lucide-react'
import { exportBackup } from '../../utils/importExport'

export function ExportButton() {
  const [exportando, setExportando] = useState(false)

  async function handleExport() {
    setExportando(true)
    try {
      await exportBackup()
    } finally {
      setExportando(false)
    }
  }

  return (
    <button
      onClick={() => void handleExport()}
      disabled={exportando}
      className="flex items-center gap-2 w-full px-4 py-3.5 rounded-xl bg-[var(--bg3)] border border-[var(--border)] text-[var(--text)] text-sm font-medium disabled:opacity-60 transition-opacity"
    >
      <Download size={18} className="text-[var(--blue)]" />
      {exportando ? 'Exportando...' : 'Exportar backup JSON'}
    </button>
  )
}
