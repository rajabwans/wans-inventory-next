import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { supabase } from "@/lib/supabase"
import { csv } from "@/lib/csv"

export const dynamic = "force-dynamic"

export async function GET() {
  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const bid = session.business_id
  const { data } = await supabase
    .from("products")
    .select("title, category, quantity, buying_price, selling_price")
    .eq("business_id", bid)
    .order("category")
    .order("title")

  const rows = (data || []).map((p: any) => [
    p.title,
    p.category || "",
    p.quantity,
    p.buying_price,
    p.selling_price,
    p.buying_price * p.quantity,
    p.selling_price * p.quantity,
  ])

  const body = csv(
    ["Product", "Category", "Qty", "Buy Price", "Sell Price", "Stock Value", "Retail Value"],
    rows
  )

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="stock_valuation.csv"`,
    },
  })
}