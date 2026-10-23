'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { addDev, moveCard, removeDev, toggleBlocked } from '@/app/actions/board'
import { FIXED_LANES, type BoardData, type Card } from '@/lib/board'
import { BoardColumn } from './board-column'
import { PriorityQueue } from './priority-queue'
import { CardDialog } from './card-dialog'
import { ThemeToggle } from './theme-toggle'

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
    <div className="app">
      <header className="app-header">
        <h1>Quadro de projetos da equipe</h1>
        <ThemeToggle />
        <input
          id="nd"
          className="inp"
          aria-label="Nome do novo desenvolvedor"
          value={devName}
          onChange={(e) => setDevName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) handleAddDev()
          }}
          placeholder="Novo desenvolvedor"
        />
        <button type="button" className="btn g" onClick={handleAddDev}>
          + Desenvolvedor
        </button>
        <button type="button" className="btn" onClick={() => setEditing(null)}>
          + Novo projeto
        </button>
      </header>

      {(notice || error) && (
        <div role="status" className="note">
          {notice || 'Não foi possível conectar ao banco de dados. Tentando novamente…'}
        </div>
      )}

      <PriorityQueue cards={cards.filter((c) => laneOf(c) !== 'done')} loading={isLoading} />

      <main className="board">
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
