import { bigint, boolean, integer, pgTable, text } from 'drizzle-orm/pg-core'

export const boardCards = pgTable('board_cards', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  client: text('client').notNull().default(''),
  prio: integer('prio').notNull().default(2),
  lane: text('lane').notNull().default('backlog'),
  owner: text('owner').notNull().default(''),
  blocked: boolean('blocked').notNull().default(false),
  since: bigint('since', { mode: 'number' }),
  note: text('note').notNull().default(''),
  ts: bigint('ts', { mode: 'number' }).notNull(),
  doneAt: bigint('done_at', { mode: 'number' }),
})

export const boardDevs = pgTable('board_devs', {
  name: text('name').primaryKey(),
  position: integer('position').notNull().default(0),
})

export type Card = typeof boardCards.$inferSelect
