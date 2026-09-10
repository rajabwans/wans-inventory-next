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
  const now = new Date()
  const defaultFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
  const defaultTo = now.toISOString().slice(0, 10)
  const from = req.nextUrl.searchParams.get("from") || defaultFrom
  const to = req.nextUrl.searchParams.get("to") || defaultTo

  const { data, error } = await supabase
    .from("sales")
    .select("*, products(title)")
    .eq("business_id", bid)
    .gte("sale_date", from + "T00:00:00")
    .lte("sale_date", to + "T23:59:59")
    .order("sale_date", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = (data || []).map((s: any) => ({
    id: s.id,
    sale_date: s.sale_date,
    product_title: s.products?.title || "",
    quantity_sold: s.quantity_sold,
    unit_price: s.unit_price,
    total_amount: s.total_amount,
    profit: s.profit,
    payment_status: s.payment_status,
    payment_method: s.payment_method,
  }))

  const totals = rows.reduce(
    (acc: any, r: any) => {
      acc.revenue += r.total_amount
      acc.profit += r.profit
      acc.quantity += r.quantity_sold
      return acc
    },
    { revenue: 0, profit: 0, quantity: 0 }
  )

  return NextResponse.json({ rows, totals })
}
