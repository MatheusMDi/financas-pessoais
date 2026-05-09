import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[MDFin] Erro React não tratado:', error, info.componentStack)

    // Se for erro de schema/banco, tenta recovery automático
    const msg = error.message ?? ''
    if (
      msg.includes('SchemaError') ||
      msg.includes('KeyPath') ||
      msg.includes('not indexed') ||
      msg.includes('VersionError')
    ) {
      const req = indexedDB.deleteDatabase('md-financas')
      req.onsuccess = () => window.location.reload()
      req.onerror = () => window.location.reload()
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      const msg = this.state.error?.message ?? ''
      const isSchemaError = msg.includes('KeyPath') || msg.includes('SchemaError') || msg.includes('not indexed')

      return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
          <div className="max-w-[380px] w-full bg-[#1a1a2e] border border-[rgba(255,77,106,0.3)] rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-white font-semibold text-sm">Erro ao carregar o app</p>
                <p className="text-[rgba(255,255,255,0.5)] text-xs mt-0.5">
                  {isSchemaError ? 'Banco de dados incompatível — recriando...' : 'Erro inesperado'}
                </p>
              </div>
            </div>

            {!isSchemaError && (
              <p className="text-[rgba(255,255,255,0.4)] text-xs font-mono bg-[rgba(0,0,0,0.3)] rounded-lg px-3 py-2 break-all">
                {msg || 'Erro desconhecido'}
              </p>
            )}

            <button
              onClick={this.handleReload}
              className="w-full py-3 rounded-xl bg-[#00e5a0] text-[#0a0a0f] font-bold text-sm"
            >
              Recarregar app
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
