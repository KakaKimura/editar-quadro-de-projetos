'use client'

import { fmtDate, PRIO_LABEL, type Card } from '@/lib/board'
import { cn } from '@/lib/utils'

type Props = { card: Card; isNext: boolean; onEdit: () => void; onToggle: () => void }

export function ProjectCard({ card: c, isNext, onEdit, onToggle }: Props) {
  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', c.id)
        e.dataTransfer.effectAllowed = 'move'
      }}
      onClick={onEdit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target === e.currentTarget) onEdit()
      }}
      tabIndex={0}
      aria-label={`Editar ${c.title}`}
      className={cn('card', `p${c.prio}`, c.blocked && 'blk', isNext && 'next')}
    >
      <div className="top">
        <span className="pb">{`P${c.prio} · ${PRIO_LABEL[c.prio]}`}</span>
        {isNext && <span className="now">{'▶ FAÇA AGORA'}</span>}
      </div>
      <div className="ti">{c.title}</div>
      {c.client && <div className="cl">{c.client}</div>}
      {c.blocked && (
        <div className="bk">
          {'⏸ AGUARDANDO CLIENTE'}
          {c.since ? ` desde ${fmtDate(c.since)}` : ''}
          {c.note && <span>{` — ${c.note}`}</span>}
        </div>
      )}
      <div className="ft">
        {c.owner && <span className="ow">{c.owner}</span>}
        {c.lane !== 'done' && (
          <button
            type="button"
            className="qb"
            onClick={(e) => {
              e.stopPropagation()
              onToggle()
            }}
          >
            {c.blocked ? '▶ Cliente respondeu' : '⏸ Cliente não respondeu'}
          </button>
        )}
      </div>
    </article>
  )
}
