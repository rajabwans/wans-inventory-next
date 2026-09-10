import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const bid = session.business_id
  const { id } = await params

  const { data: purchase, error } = await supabase
    .from("purchases")
    .select("*, suppliers(name, phone, email)")
    .eq("id", Number(id))
    .eq("business_id", bid)
    .single()

  if (error || !purchase) return NextResponse.json({ error: "Purchase not found" }, { status: 404 })

  const { data: items, error: itemsErr } = await supabase
    .from("purchase_items")
    .select("*, products(title)")
    .eq("purchase_id", Number(id))
    .eq("business_id", bid)

  if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 })

  const enrichedItems = (items || []).map((item: any) => ({
    ...item,
    product_title: item.products?.title || "Deleted product",
  }))

  return NextResponse.json({
    ...purchase,
    supplier_name: purchase.suppliers?.name || "Unknown",
    supplier_phone: purchase.suppliers?.phone || null,
    supplier_email: purchase.suppliers?.email || null,
    items: enrichedItems,
  })
}
