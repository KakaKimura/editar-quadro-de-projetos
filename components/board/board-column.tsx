'use client'

import { useState } from 'react'
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
      className={cn('col', isDev ? 'dev' : laneKey, over && 'over')}
    >
      <div className="ch">
        <div className="n">
          <h3>{name}</h3>
          {isDev && !list.length ? (
            <button type="button" className="qb" title="Remover coluna" aria-label={`Remover coluna ${name}`} onClick={onRemove}>
              {'✕'}
            </button>
          ) : (
            <span className="count">{list.length}</span>
          )}
        </div>
        {showNext &&
          (!list.length ? (
            <div className="nx">Sem projetos</div>
          ) : next ? (
            <div className="nx ok">{`▶ Próximo: ${next.title}`}</div>
          ) : (
            <div className="nx no">{'⏸ Todos aguardando cliente'}</div>
          ))}
      </div>
      <div className="cards">
        {list.map((c) => (
          <ProjectCard
            key={c.id}
            card={c}
            isNext={!!next && c.id === next.id && laneKey !== 'hoje' && laneKey !== 'backlog'}
            onEdit={() => onEdit(c)}
            onToggle={() => onToggle(c)}
          />
        ))}
        {!list.length && <div className="empty">Arraste um projeto para cá</div>}
      </div>
    </section>
  )
}
