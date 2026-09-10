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

  const { data, error } = await supabase
    .from("stock_adjustments")
    .select("*")
    .eq("business_id", bid)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = data || []
  if (rows.length === 0) return NextResponse.json([])

  const productIds = [...new Set(rows.map((r: any) => r.product_id))]
  const { data: products } = await supabase
    .from("products")
    .select("id, title")
    .in("id", productIds)

  const productMap = new Map<number, string>()
  for (const p of products || []) {
    productMap.set(p.id, p.title)
  }

  const enriched = rows.map((r: any) => ({
    ...r,
    product_title: productMap.get(r.product_id) || "Deleted product",
  }))

  return NextResponse.json(enriched)
}
