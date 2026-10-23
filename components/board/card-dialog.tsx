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

const field = 'inp'

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
      className="md"
    >
      <form
        
        onSubmit={(e) => {
          e.preventDefault()
          if (!title.trim()) return
          handle(() =>
            saveCard({ id: card?.id, title, client, prio, lane, owner, blocked, note }),
          )
        }}
      >
        <h2 id="dlg-title">
          {card ? 'Editar projeto' : 'Novo projeto'}
        </h2>
        <label>
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
        <label>
          Cliente
          <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Cliente" className={field} />
        </label>
        <label>
          Prioridade (P1 é a mais alta)
          <select value={prio} onChange={(e) => setPrio(Number(e.target.value))} className={field}>
            {[1, 2, 3, 4].map((i) => (
              <option key={i} value={i}>{`P${i} · ${PRIO_LABEL[i]}`}</option>
            ))}
          </select>
        </label>
        <>
          <label>
            Coluna
            <select value={lane} onChange={(e) => setLane(e.target.value)} className={field}>
              {lanes.map(([v, n]) => (
                <option key={v} value={v}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label>
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
        </>
        <label className="chk">
          <input
            type="checkbox"
            checked={blocked}
            onChange={(e) => setBlocked(e.target.checked)}
           
          />
          Aguardando cliente (cliente não respondeu)
        </label>
        <label>
          Observação
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex.: aguardando retorno por e-mail"
            className={field}
          />
        </label>
        <div className="r">
          {card && (
            <button
              type="button"
              disabled={pending}
              onClick={() => handle(() => deleteCard(card.id))}
              className="btn d"
            >
              Excluir
            </button>
          )}
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="btn g"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending}
            className="btn"
          >
            {pending ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
