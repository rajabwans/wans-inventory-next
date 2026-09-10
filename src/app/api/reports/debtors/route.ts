import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(_req: NextRequest) {
  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const bid = session.business_id

  const { data, error } = await supabase
    .from("sales")
    .select("id, customer_name, customer_id, customers(name), total_amount, amount_paid, sale_date, payment_status")
    .eq("business_id", bid)
    .in("payment_status", ["partial", "unpaid"])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const now = new Date()
  const grouped: Record<string, { balance: number; buckets: { zero: number; thirty: number; sixty: number; ninety: number } }> = {}

  for (const s of data || []) {
    const customer = (s as any).customers?.name || s.customer_name || "Walk-in"
    const balance = s.total_amount - s.amount_paid
    if (balance <= 0) continue

    const daysSince = Math.floor((now.getTime() - new Date(s.sale_date).getTime()) / (1000 * 60 * 60 * 24))

    if (!grouped[customer]) {
      grouped[customer] = { balance: 0, buckets: { zero: 0, thirty: 0, sixty: 0, ninety: 0 } }
    }
    grouped[customer].balance += balance

    if (daysSince <= 30) grouped[customer].buckets.zero += balance
    else if (daysSince <= 60) grouped[customer].buckets.thirty += balance
    else if (daysSince <= 90) grouped[customer].buckets.sixty += balance
    else grouped[customer].buckets.ninety += balance
  }

  const rows = Object.entries(grouped).map(([customer, v]) => ({ customer, ...v }))
  const total = rows.reduce((sum, r) => sum + r.balance, 0)

  return NextResponse.json({ rows, total })
}
