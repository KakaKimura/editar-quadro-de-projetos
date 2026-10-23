import type { Card } from '@/lib/db/schema'

export type { Card }

export type BoardData = { cards: Card[]; devs: string[] }

export const PRIO_LABEL = ['', 'Urgente', 'Alta', 'Média', 'Baixa'] as const
export const FIXED_LANES = ['backlog', 'hoje', 'done'] as const

export const laneName = (k: string) =>
  k === 'backlog' ? 'Novos projetos' : k === 'hoje' ? 'Em andamento hoje' : k === 'done' ? 'Concluído' : k

export const sortCards = (a: Card, b: Card) =>
  Number(a.blocked) - Number(b.blocked) || a.prio - b.prio || a.ts - b.ts

export const sortQueue = (a: Card, b: Card) => a.prio - b.prio || a.ts - b.ts

export const fmtDate = (t: number) =>
  new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

export const prioStyles: Record<number, { border: string; text: string; bg: string }> = {
  1: { border: 'border-l-p1-soft', text: 'text-p1', bg: 'bg-p1-soft/40' },
  2: { border: 'border-l-p2-soft', text: 'text-p2', bg: 'bg-p2-soft/40' },
  3: { border: 'border-l-p3-soft', text: 'text-p3', bg: 'bg-p3-soft/40' },
  4: { border: 'border-l-p4-soft', text: 'text-p4', bg: 'bg-p4-soft/40' },
}
