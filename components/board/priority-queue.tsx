import { Pause } from 'lucide-react'
import { prioStyles, sortQueue, type Card } from '@/lib/board'
import { cn } from '@/lib/utils'

export function PriorityQueue({ cards, loading }: { cards: Card[]; loading: boolean }) {
  const open = [...cards].sort(sortQueue)
  const firstIdx = open.findIndex((c) => !c.blocked)

  return (
    <section aria-labelledby="queue-title" className="px-4 pt-3 md:px-6">
      <h2 id="queue-title" className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Fila de prioridade (projetos abertos)
      </h2>
      <ol className="flex gap-2 overflow-x-auto py-2">
        {loading && <li className="text-sm text-muted-foreground">Carregando…</li>}
        {!loading && !open.length && (
          <li className="text-sm text-muted-foreground">
            {'Nenhum projeto aberto. Clique em "Novo projeto".'}
          </li>
        )}
        {open.map((c, i) => {
          const first = i === firstIdx
          return (
            <li
              key={c.id}
              title={c.title}
              className={cn(
                'flex max-w-64 flex-none items-center gap-1 truncate rounded-lg border border-l-4 border-border bg-card px-2.5 py-1.5 text-sm',
                prioStyles[c.prio]?.border,
                c.blocked && 'opacity-50 line-through',
                first && 'border-ok-soft bg-ok-soft/30 font-semibold',
              )}
            >
              {first && <span className="text-ok">{'PRÓXIMO ·'}</span>}
              {c.blocked && <Pause className="size-3.5 shrink-0" aria-label="Aguardando cliente" />}
              <span className="truncate">
                {`P${c.prio} ${c.title}`}
                {c.client && ` · ${c.client}`}
                {c.owner && ` (${c.owner})`}
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
