'use client'

import { Pause, Play } from 'lucide-react'
import { fmtDate, PRIO_LABEL, prioStyles, type Card } from '@/lib/board'
import { cn } from '@/lib/utils'

type Props = { card: Card; isNext: boolean; onEdit: () => void; onToggle: () => void }

export function ProjectCard({ card: c, isNext, onEdit, onToggle }: Props) {
  const p = prioStyles[c.prio] ?? prioStyles[4]

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
      className={cn(
        'cursor-grab rounded-lg border border-l-[5px] border-border bg-card px-2.5 py-2 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-accent active:cursor-grabbing',
        p.border,
        c.blocked &&
          'bg-[repeating-linear-gradient(135deg,var(--card)_0_8px,var(--stripe)_8px_16px)] opacity-80',
        isNext && 'ring-2 ring-ok-soft',
      )}
    >
      <div className="mb-1 flex items-center justify-between gap-1.5 text-[11px] font-bold">
        <span className={p.text}>{`P${c.prio} · ${PRIO_LABEL[c.prio]}`}</span>
        {isNext && (
          <span className="inline-flex items-center gap-1 rounded bg-ok-soft/60 px-1.5 py-px text-ok">
            <Play className="size-2.5" aria-hidden="true" />
            FAÇA AGORA
          </span>
        )}
      </div>
      <p className="font-medium text-pretty">{c.title}</p>
      {c.client && <p className="text-xs text-muted-foreground">{c.client}</p>}
      {c.blocked && (
        <p className="mt-1.5 text-xs font-semibold text-p1">
          {'Aguardando cliente'}
          {c.since ? ` desde ${fmtDate(c.since)}` : ''}
          {c.note && <span className="font-normal text-muted-foreground">{` — ${c.note}`}</span>}
        </p>
      )}
      <div className="mt-2 flex items-center justify-between gap-1.5">
        {c.owner && (
          <span className="rounded-full bg-accent/60 px-2 py-px text-[11px] font-semibold text-accent-foreground">
            {c.owner}
          </span>
        )}
        {c.lane !== 'done' && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggle()
            }}
            className="ml-auto inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-column"
          >
            {c.blocked ? (
              <>
                <Play className="size-3" aria-hidden="true" />
                Cliente respondeu
              </>
            ) : (
              <>
                <Pause className="size-3" aria-hidden="true" />
                Cliente não respondeu
              </>
            )}
          </button>
        )}
      </div>
    </article>
  )
}
