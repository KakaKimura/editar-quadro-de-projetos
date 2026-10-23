'use client'

import { useEffect, useRef, useState } from 'react'
import { deleteCard, saveCard } from '@/app/actions/board'
import { PRIO_LABEL, type Card } from '@/lib/board'

type Props = {
  card: Card | null
  devs: string[]
  onClose: () => void
  onDone: (error?: string) => void
}

const field =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent'

export function CardDialog({ card, devs, onClose, onDone }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const [pending, setPending] = useState(false)
  const [title, setTitle] = useState(card?.title ?? '')
  const [client, setClient] = useState(card?.client ?? '')
  const [prio, setPrio] = useState(card?.prio ?? 2)
  const [lane, setLane] = useState(card?.lane ?? 'backlog')
  const [owner, setOwner] = useState(card?.owner ?? '')
  const [blocked, setBlocked] = useState(card?.blocked ?? false)
  const [note, setNote] = useState(card?.note ?? '')

  useEffect(() => {
    ref.current?.showModal()
  }, [])

  const lanes: [string, string][] = [
    ['backlog', 'Novos projetos'],
    ...devs.map((d): [string, string] => [d, d]),
    ['hoje', 'Em andamento hoje'],
    ['done', 'Concluído'],
  ]

  async function handle(action: () => Promise<unknown>) {
    setPending(true)
    try {
      await action()
      onDone()
    } catch (e) {
      onDone(e instanceof Error ? e.message : 'Não foi possível salvar.')
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) ref.current?.close()
      }}
      aria-labelledby="dlg-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-card p-0 text-foreground shadow-xl backdrop:bg-foreground/30"
    >
      <form
        className="grid gap-3 p-5"
        onSubmit={(e) => {
          e.preventDefault()
          if (!title.trim()) return
          handle(() =>
            saveCard({ id: card?.id, title, client, prio, lane, owner, blocked, note }),
          )
        }}
      >
        <h2 id="dlg-title" className="text-lg font-semibold">
          {card ? 'Editar projeto' : 'Novo projeto'}
        </h2>
        <label className="grid gap-1 text-xs text-muted-foreground">
          Projeto
          <input
            autoFocus
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nome do projeto ou tarefa"
            className={field}
          />
        </label>
        <label className="grid gap-1 text-xs text-muted-foreground">
          Cliente
          <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Cliente" className={field} />
        </label>
        <label className="grid gap-1 text-xs text-muted-foreground">
          Prioridade (P1 é a mais alta)
          <select value={prio} onChange={(e) => setPrio(Number(e.target.value))} className={field}>
            {[1, 2, 3, 4].map((i) => (
              <option key={i} value={i}>{`P${i} · ${PRIO_LABEL[i]}`}</option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-xs text-muted-foreground">
            Coluna
            <select value={lane} onChange={(e) => setLane(e.target.value)} className={field}>
              {lanes.map(([v, n]) => (
                <option key={v} value={v}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs text-muted-foreground">
            Responsável
            <select
              value={devs.includes(lane) ? lane : owner}
              disabled={devs.includes(lane)}
              onChange={(e) => setOwner(e.target.value)}
              className={field}
            >
              <option value="">— sem responsável —</option>
              {devs.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={blocked}
            onChange={(e) => setBlocked(e.target.checked)}
            className="size-4 accent-[var(--p1)]"
          />
          Aguardando cliente (cliente não respondeu)
        </label>
        <label className="grid gap-1 text-xs text-muted-foreground">
          Observação
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex.: aguardando retorno por e-mail"
            className={field}
          />
        </label>
        <div className="mt-1 flex flex-wrap justify-end gap-2">
          {card && (
            <button
              type="button"
              disabled={pending}
              onClick={() => handle(() => deleteCard(card.id))}
              className="mr-auto rounded-lg border border-p1-soft px-3 py-2 text-sm font-medium text-p1 hover:bg-p1-soft/30 disabled:opacity-50"
            >
              Excluir
            </button>
          )}
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-column"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
          >
            {pending ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
