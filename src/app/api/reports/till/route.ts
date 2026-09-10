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
  const date = req.nextUrl.searchParams.get("date") || new Date().toISOString().slice(0, 10)

  const { data: sales, error: salesErr } = await supabase
    .from("sales")
    .select("total_amount, amount_paid, payment_method, payment_status")
    .eq("business_id", bid)
    .gte("sale_date", date + "T00:00:00")
    .lte("sale_date", date + "T23:59:59")

  if (salesErr) return NextResponse.json({ error: salesErr.message }, { status: 500 })

  const byMethod: Record<string, { total: number; count: number }> = {}
  for (const s of sales || []) {
    const method = s.payment_method || "cash"
    if (!byMethod[method]) byMethod[method] = { total: 0, count: 0 }
    byMethod[method].total += s.amount_paid
    byMethod[method].count += 1
  }

  const creditTotal = (sales || [])
    .filter((s: any) => s.payment_status === "unpaid" || s.payment_status === "partial")
    .reduce((sum: number, s: any) => sum + (s.total_amount - s.amount_paid), 0)

  const salesTotal = (sales || []).reduce((sum: number, s: any) => sum + s.total_amount, 0)
  const count = (sales || []).length

  const { data: closures, error: cloErr } = await supabase
    .from("till_closures")
    .select("*")
    .eq("business_id", bid)
    .order("close_date", { ascending: false })
    .limit(10)

  if (cloErr) return NextResponse.json({ error: cloErr.message }, { status: 500 })

  return NextResponse.json({
    date,
    sales_total: salesTotal,
    count,
    by_method: byMethod,
    credit_total: creditTotal,
    closures: closures || [],
  })
}
