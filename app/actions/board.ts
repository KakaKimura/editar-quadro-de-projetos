'use server'

import { eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { boardCards, boardDevs } from '@/lib/db/schema'

const RESERVED = ['backlog', 'hoje', 'done']
const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

async function validLanes() {
  const devs = await db.select({ name: boardDevs.name }).from(boardDevs)
  const names = devs.map((d) => d.name)
  return { names, lanes: [...RESERVED, ...names] }
}

export type CardInput = {
  id?: string
  title: string
  client: string
  prio: number
  lane: string
  owner: string
  blocked: boolean
  note: string
}

export async function saveCard(input: CardInput) {
  const title = clean(input.title, 200)
  if (!title) throw new Error('Informe o nome do projeto.')
  const prio = Number(input.prio)
  if (![1, 2, 3, 4].includes(prio)) throw new Error('Prioridade inválida.')
  const { names, lanes } = await validLanes()
  const lane = lanes.includes(input.lane) ? input.lane : 'backlog'
  const owner = names.includes(lane) ? lane : names.includes(input.owner) ? input.owner : ''
  const blocked = !!input.blocked && lane !== 'done'
  const now = Date.now()
  const base = {
    title,
    client: clean(input.client, 200),
    prio,
    lane,
    owner,
    blocked,
    note: clean(input.note, 500),
  }

  const id = typeof input.id === 'string' && input.id ? input.id.slice(0, 40) : null
  const existing = id ? (await db.select().from(boardCards).where(eq(boardCards.id, id)))[0] : undefined

  if (existing) {
    await db
      .update(boardCards)
      .set({
        ...base,
        since: blocked ? (existing.blocked && existing.since ? existing.since : now) : null,
        doneAt: lane === 'done' ? (existing.doneAt ?? now) : null,
      })
      .where(eq(boardCards.id, existing.id))
  } else {
    await db.insert(boardCards).values({
      id: 'c' + now.toString(36) + Math.random().toString(36).slice(2, 6),
      ...base,
      since: blocked ? now : null,
      ts: now,
      doneAt: lane === 'done' ? now : null,
    })
  }
}

export async function moveCard(id: string, lane: string) {
  const { names, lanes } = await validLanes()
  if (!lanes.includes(lane)) throw new Error('Coluna inválida.')
  const patch: Partial<typeof boardCards.$inferInsert> = { lane }
  if (names.includes(lane)) patch.owner = lane
  if (lane === 'done') {
    patch.blocked = false
    patch.since = null
    patch.doneAt = Date.now()
  }
  await db.update(boardCards).set(patch).where(eq(boardCards.id, String(id)))
}

export async function toggleBlocked(id: string) {
  const [card] = await db.select().from(boardCards).where(eq(boardCards.id, String(id)))
  if (!card) return
  await db
    .update(boardCards)
    .set(card.blocked ? { blocked: false, since: null } : { blocked: true, since: Date.now() })
    .where(eq(boardCards.id, card.id))
}

export async function deleteCard(id: string) {
  await db.delete(boardCards).where(eq(boardCards.id, String(id)))
}

export async function addDev(rawName: string) {
  const name = clean(rawName, 60)
  if (!name || RESERVED.includes(name.toLowerCase())) throw new Error('Nome inválido.')
  await db
    .insert(boardDevs)
    .values({
      name,
      position: sql`(select coalesce(max(${boardDevs.position}), 0) + 1 from ${boardDevs})`,
    })
    .onConflictDoNothing()
}

export async function reorderDevs(order: string[]) {
  const { names } = await validLanes()
  if (
    !Array.isArray(order) ||
    order.length !== names.length ||
    !order.every((n) => names.includes(n)) ||
    new Set(order).size !== order.length
  ) {
    throw new Error('Ordem de colunas inválida.')
  }
  await Promise.all(
    order.map((name, i) => db.update(boardDevs).set({ position: i + 1 }).where(eq(boardDevs.name, name))),
  )
}

export async function removeDev(name: string) {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(boardCards)
    .where(eq(boardCards.lane, String(name)))
  if (count > 0) throw new Error('Mova os projetos desta coluna antes de removê-la.')
  await db.delete(boardDevs).where(eq(boardDevs.name, String(name)))
}
