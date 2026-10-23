'use client'

import { useState } from 'react'
import { Pause, Play, X } from 'lucide-react'
import { laneName, sortCards, type Card } from '@/lib/board'
import { cn } from '@/lib/utils'
import { ProjectCard } from './project-card'

type Props = {
  laneKey: string
  isDev: boolean
  cards: Card[]
  onDropCard: (id: string, lane: string) => void
  onEdit: (c: Card) => void
  onToggle: (c: Card) => void
  onRemove: () => void
}

const topColor: Record<string, string> = {
  backlog: 'border-t-border',
  hoje: 'border-t-hoje',
  done: 'border-t-ok-soft',
}

export function BoardColumn({ laneKey, isDev, cards, onDropCard, onEdit, onToggle, onRemove }: Props) {
  const [over, setOver] = useState(false)
  const list = [...cards].sort(sortCards)
  const next = laneKey !== 'done' ? list.find((c) => !c.blocked) : undefined
  const showNext = isDev || laneKey === 'backlog'
  const name = laneName(laneKey)

  return (
    <section
      aria-label={name}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        const id = e.dataTransfer.getData('text/plain')
        if (id) onDropCard(id, laneKey)
      }}
      className={cn(
        'flex max-h-full w-72 flex-none flex-col rounded-xl border-t-4 bg-column transition-shadow',
        isDev ? 'border-t-accent' : topColor[laneKey],
        over && 'ring-2 ring-accent ring-dashed',
      )}
    >
      <div className="px-3 pt-2.5 pb-1.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-semibold">{name}</h3>
          {isDev && !list.length ? (
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remover coluna ${name}`}
              className="rounded-md p-1 text-muted-foreground hover:bg-card"
            >
              <X className="size-4" />
            </button>
          ) : (
            <span className="text-sm text-muted-foreground">{list.length}</span>
          )}
        </div>
        {showNext && (
          <p
            className={cn(
              'mt-1.5 flex items-center gap-1.5 truncate rounded-md border bg-card px-2 py-1 text-xs',
              !list.length && 'border-border text-muted-foreground',
              list.length && next && 'border-ok-soft font-medium text-ok',
              list.length && !next && 'border-p1-soft font-medium text-p1',
            )}
          >
            {!list.length ? (
              'Sem projetos'
            ) : next ? (
              <>
                <Play className="size-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{`Próximo: ${next.title}`}</span>
              </>
            ) : (
              <>
                <Pause className="size-3 shrink-0" aria-hidden="true" />
                Todos aguardando cliente
              </>
            )}
          </p>
        )}
      </div>
      <div className="flex min-h-16 flex-col gap-2 overflow-y-auto px-2.5 pt-1 pb-2.5">
        {list.map((c) => (
          <ProjectCard
            key={c.id}
            card={c}
            isNext={!!next && c.id === next.id && laneKey !== 'hoje' && laneKey !== 'backlog'}
            onEdit={() => onEdit(c)}
            onToggle={() => onToggle(c)}
          />
        ))}
        {!list.length && (
          <p className="rounded-lg border border-dashed border-border px-1 py-3.5 text-center text-xs text-muted-foreground">
            Arraste um projeto para cá
          </p>
        )}
      </div>
    </section>
  )
}
