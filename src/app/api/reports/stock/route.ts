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
    .from("products")
    .select("title, category, quantity, buying_price, selling_price")
    .eq("business_id", bid)
    .order("title")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = (data || []).map((p: any) => ({
    title: p.title,
    category: p.category || "",
    quantity: p.quantity,
    buying_price: p.buying_price,
    selling_price: p.selling_price,
    stock_value: p.buying_price * p.quantity,
    potential_revenue: p.selling_price * p.quantity,
    potential_profit: (p.selling_price - p.buying_price) * p.quantity,
  }))

  const totals = rows.reduce(
    (acc: any, r: any) => {
      acc.quantity += r.quantity
      acc.stock_value += r.stock_value
      acc.potential_revenue += r.potential_revenue
      acc.potential_profit += r.potential_profit
      return acc
    },
    { quantity: 0, stock_value: 0, potential_revenue: 0, potential_profit: 0 }
  )

  return NextResponse.json({ rows, totals })
}
