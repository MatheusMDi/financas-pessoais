import type { EventoFluxo } from '../../utils/calcFluxo'
import { FluxoItem } from './FluxoItem'

interface FluxoTimelineProps {
  eventos: EventoFluxo[]
}

export function FluxoTimeline({ eventos }: FluxoTimelineProps) {
  if (eventos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-[var(--text3)]">
        <p className="text-sm">Nenhum evento no período</p>
      </div>
    )
  }

  return (
    <div className="pt-2 pb-4">
      {eventos.map((evento, index) => (
        <FluxoItem
          key={`${evento.data}-${evento.descricao}-${index}`}
          evento={evento}
          isLast={index === eventos.length - 1}
        />
      ))}
    </div>
  )
}
