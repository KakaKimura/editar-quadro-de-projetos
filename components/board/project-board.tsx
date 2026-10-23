'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, UserPlus } from 'lucide-react'
import { addDev, moveCard, removeDev, toggleBlocked } from '@/app/actions/board'
import { FIXED_LANES, type BoardData, type Card } from '@/lib/board'
import { BoardColumn } from './board-column'
import { PriorityQueue } from './priority-queue'
import { CardDialog } from './card-dialog'

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error('Falha ao carregar o quadro')
    return r.json() as Promise<BoardData>
  })

export function ProjectBoard() {
  const { data, error, isLoading, mutate } = useSWR<BoardData>('/api/board', fetcher, {
    refreshInterval: 5000,
  })
  const [devName, setDevName] = useState('')
  const [editing, setEditing] = useState<Card | null | undefined>(undefined)
  const [notice, setNotice] = useState('')

  const cards = data?.cards ?? []
  const devs = data?.devs ?? []
  const keys = ['backlog', ...devs, 'hoje', 'done']
  const laneOf = (c: Card) => (keys.includes(c.lane) ? c.lane : 'backlog')

  async function run(action: () => Promise<unknown>, optimistic?: BoardData) {
    setNotice('')
    try {
      if (optimistic) mutate(optimistic, { revalidate: false })
      await action()
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Não foi possível salvar.')
    } finally {
      mutate()
    }
  }

  function handleMove(id: string, lane: string) {
    const optimistic = {
      devs,
      cards: cards.map((c) =>
        c.id === id
          ? {
              ...c,
              lane,
              owner: devs.includes(lane) ? lane : c.owner,
              ...(lane === 'done' ? { blocked: false, since: null } : {}),
            }
          : c,
      ),
    }
    run(() => moveCard(id, lane), optimistic)
  }

  function handleToggle(c: Card) {
    const optimistic = {
      devs,
      cards: cards.map((x) =>
        x.id === c.id ? { ...x, blocked: !x.blocked, since: x.blocked ? null : Date.now() } : x,
      ),
    }
    run(() => toggleBlocked(c.id), optimistic)
  }

  function handleAddDev() {
    const v = devName.trim()
    if (!v || devs.includes(v) || (FIXED_LANES as readonly string[]).includes(v.toLowerCase())) return
    setDevName('')
    run(() => addDev(v), { cards, devs: [...devs, v] })
  }

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b border-border bg-card/60 px-4 py-3 md:px-6">
        <h1 className="flex-1 text-lg font-semibold text-pretty">Quadro de projetos da equipe</h1>
        <div className="flex items-center gap-2">
          <label htmlFor="new-dev" className="sr-only">
            Nome do novo desenvolvedor
          </label>
          <input
            id="new-dev"
            value={devName}
            onChange={(e) => setDevName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) handleAddDev()
            }}
            placeholder="Novo desenvolvedor"
            className="w-40 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <button
            type="button"
            onClick={handleAddDev}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-column"
          >
            <UserPlus className="size-4" aria-hidden="true" />
            Desenvolvedor
          </button>
        </div>
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
        >
          <Plus className="size-4" aria-hidden="true" />
          Novo projeto
        </button>
      </header>

      {(notice || error) && (
        <div role="status" className="bg-p3-soft/40 px-4 py-2 text-sm text-foreground md:px-6">
          {notice || 'Não foi possível conectar ao banco de dados. Tentando novamente…'}
        </div>
      )}

      <PriorityQueue cards={cards.filter((c) => laneOf(c) !== 'done')} loading={isLoading} />

      <main className="flex min-h-0 flex-1 items-start gap-3 overflow-auto px-4 pt-2 pb-4 md:px-6">
        {keys.map((k) => (
          <BoardColumn
            key={k}
            laneKey={k}
            isDev={devs.includes(k)}
            cards={cards.filter((c) => laneOf(c) === k)}
            onDropCard={handleMove}
            onEdit={(c) => setEditing(c)}
            onToggle={handleToggle}
            onRemove={() => run(() => removeDev(k), { cards, devs: devs.filter((d) => d !== k) })}
          />
        ))}
      </main>

      {editing !== undefined && (
        <CardDialog
          card={editing}
          devs={devs}
          onClose={() => setEditing(undefined)}
          onDone={(err) => {
            setEditing(undefined)
            setNotice(err ?? '')
            mutate()
          }}
        />
      )}
    </div>
  )
}
