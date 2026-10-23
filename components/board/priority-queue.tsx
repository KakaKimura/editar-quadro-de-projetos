import { sortQueue, type Card } from '@/lib/board'
import { cn } from '@/lib/utils'

export function PriorityQueue({ cards, loading }: { cards: Card[]; loading: boolean }) {
  const open = [...cards].sort(sortQueue)
  const firstIdx = open.findIndex((c) => !c.blocked)

  return (
    <section aria-labelledby="queue-title" className="qwrap">
      <h2 id="queue-title">Fila de prioridade (projetos abertos)</h2>
      <ol className="queue">
        {loading && <li className="cl">Carregando…</li>}
        {!loading && !open.length && <li className="cl">{'Nenhum projeto aberto. Clique em “+ Novo projeto”.'}</li>}
        {open.map((c, i) => {
          const first = i === firstIdx
          return (
            <li key={c.id} title={c.title} className={cn('chip', `p${c.prio}`, c.blocked && 'blk', first && 'first')}>
              {(first ? 'PRÓXIMO · ' : c.blocked ? '⏸ ' : '') +
                `P${c.prio} ${c.title}` +
                (c.client ? ` · ${c.client}` : '') +
                (c.owner ? ` (${c.owner})` : '')}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
