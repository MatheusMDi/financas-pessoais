import { useState, useRef } from 'react'
import { Upload, X, FileJson, FileText } from 'lucide-react'
import { validateBackup, importBackup, parseCSVDividas, importCSVDividas, type BackupData, type BackupSummary } from '../../utils/importExport'
import { formatBRL } from '../../utils/formatCurrency'
import type { Divida } from '../../db/types'

type Aba = 'json' | 'csv'

interface ImportModalProps {
  onFechar: () => void
  onSucesso: () => void
}

export function ImportModal({ onFechar, onSucesso }: ImportModalProps) {
  const [aba, setAba] = useState<Aba>('json')
  const [erro, setErro] = useState('')
  const [importando, setImportando] = useState(false)
  const [preview, setPreview] = useState<{ data: BackupData; contagens: BackupSummary } | null>(null)
  const [csvPreview, setCsvPreview] = useState<{ rows: Divida[]; errors: string[] } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) processarArquivo(file)
  }

  function processarArquivo(file: File) {
    setErro('')
    setPreview(null)
    setCsvPreview(null)

    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      if (aba === 'json') {
        try {
          const raw: unknown = JSON.parse(text)
          const result = validateBackup(raw)
          if (!result.valid) {
            setErro(result.error)
            return
          }
          setPreview({ data: result.data, contagens: result.summary })
        } catch {
          setErro('Arquivo JSON inválido')
        }
      } else {
        const parsed = parseCSVDividas(text)
        setCsvPreview(parsed)
      }
    }
    reader.readAsText(file)
  }

  async function confirmarImportJSON() {
    if (!preview) return
    setImportando(true)
    try {
      await importBackup(preview.data)
      onSucesso()
      onFechar()
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao importar')
    } finally {
      setImportando(false)
    }
  }

  async function confirmarImportCSV() {
    if (!csvPreview || csvPreview.rows.length === 0) return
    setImportando(true)
    try {
      await importCSVDividas(csvPreview.rows)
      onSucesso()
      onFechar()
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao importar CSV')
    } finally {
      setImportando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onFechar} />
      <div className="relative w-full max-w-[430px] mx-auto bg-[var(--bg2)] rounded-t-[20px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 pt-4 pb-2 sticky top-0 bg-[var(--bg2)] border-b border-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--text)]">Importar dados</h2>
          <button onClick={onFechar} className="p-1.5 text-[var(--text3)] hover:text-[var(--text)]"><X size={20} /></button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => { setAba('json'); setPreview(null); setCsvPreview(null); setErro('') }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${aba === 'json' ? 'bg-[var(--blue)] text-white' : 'bg-[var(--bg3)] text-[var(--text2)] border border-[var(--border)]'}`}
            >
              <FileJson size={15} /> JSON
            </button>
            <button
              onClick={() => { setAba('csv'); setPreview(null); setCsvPreview(null); setErro('') }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${aba === 'csv' ? 'bg-[var(--blue)] text-white' : 'bg-[var(--bg3)] text-[var(--text2)] border border-[var(--border)]'}`}
            >
              <FileText size={15} /> CSV (Dívidas)
            </button>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[var(--border2)] rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-[var(--blue)] transition-colors"
          >
            <Upload size={24} className="text-[var(--text3)]" />
            <p className="text-sm text-[var(--text2)]">Arraste ou toque para selecionar</p>
            <p className="text-xs text-[var(--text3)]">{aba === 'json' ? '.json' : '.csv'}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept={aba === 'json' ? '.json' : '.csv'}
              className="hidden"
              onChange={e => e.target.files?.[0] && processarArquivo(e.target.files[0])}
            />
          </div>

          {erro && <p className="text-sm text-[var(--red)] bg-[rgba(255,77,106,0.08)] px-3 py-2 rounded-lg">{erro}</p>}

          {preview && (
            <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-3.5">
              <p className="text-sm font-medium text-[var(--text)] mb-2">Prévia — substituirá todos os dados:</p>
              {(Object.entries(preview.contagens) as [string, number][]).map(([k, v]) => (
                <div key={k} className="flex justify-between py-0.5">
                  <span className="text-sm text-[var(--text2)]">{k}</span>
                  <span className="font-mono text-sm text-[var(--text)]">{String(v)} registros</span>
                </div>
              ))}
              <button
                onClick={() => void confirmarImportJSON()}
                disabled={importando}
                className="mt-3 w-full py-3 rounded-xl bg-[var(--red)] text-white font-semibold text-sm disabled:opacity-60"
              >
                {importando ? 'Importando...' : '⚠️ Confirmar — substituir tudo'}
              </button>
            </div>
          )}

          {csvPreview && (
            <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl p-3.5">
              <p className="text-sm font-medium text-[var(--text)] mb-2">{csvPreview.rows.length} dívidas para importar</p>
              {csvPreview.errors.length > 0 && (
                <div className="mb-2">
                  {csvPreview.errors.map((e, i) => <p key={i} className="text-xs text-[var(--yellow)]">{e}</p>)}
                </div>
              )}
              {csvPreview.rows.slice(0, 3).map((r, i) => (
                <div key={i} className="py-0.5 flex justify-between">
                  <span className="text-sm text-[var(--text2)] truncate">{r.nome}</span>
                  <span className="font-mono text-xs text-[var(--text3)] shrink-0 ml-2">{formatBRL(r.valorParcela)}/mês</span>
                </div>
              ))}
              {csvPreview.rows.length > 3 && <p className="text-xs text-[var(--text3)] mt-1">+ {csvPreview.rows.length - 3} mais...</p>}
              {csvPreview.rows.length > 0 && (
                <button
                  onClick={() => void confirmarImportCSV()}
                  disabled={importando}
                  className="mt-3 w-full py-3 rounded-xl bg-[var(--green)] text-[#0a0a0f] font-semibold text-sm disabled:opacity-60"
                >
                  {importando ? 'Importando...' : 'Adicionar dívidas'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
