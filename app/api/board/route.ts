import { asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { boardCards, boardDevs } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [cards, devs] = await Promise.all([
    db.select().from(boardCards),
    db.select().from(boardDevs).orderBy(asc(boardDevs.position), asc(boardDevs.name)),
  ])
  return Response.json({ cards, devs: devs.map((d) => d.name) })
}
