import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const bid = session.business_id
  const days = Number(req.nextUrl.searchParams.get("days")) || 30
  const today = new Date()
  const cutoff = new Date(today)
  cutoff.setDate(cutoff.getDate() + days)

  const todayStr = today.toISOString().slice(0, 10)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from("product_batches")
    .select("quantity, expiry_date, products(title)")
    .eq("business_id", bid)
    .not("expiry_date", "is", null)
    .gt("quantity", 0)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const expiring: any[] = []
  const expired: any[] = []

  for (const b of data || []) {
    const expDate = (b as any).expiry_date
    if (!expDate) continue
    const expStr = expDate.slice(0, 10)
    const daysLeft = Math.ceil((new Date(expStr).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const title = (b as any).products?.title || ""

    if (daysLeft < 0) {
      expired.push({ title, qty: (b as any).quantity, expiry_date: expStr, days_left: daysLeft })
    } else if (expStr <= cutoffStr) {
      expiring.push({ title, qty: (b as any).quantity, expiry_date: expStr, days_left: daysLeft })
    }
  }

  return NextResponse.json({
    expiring: expiring.sort((a, b) => a.days_left - b.days_left),
    expired: expired.sort((a, b) => a.days_left - b.days_left),
  })
}
