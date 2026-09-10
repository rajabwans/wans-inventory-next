import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const bid = session.business_id
  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 })

  const allowed = ["damaged", "stolen", "returned", "restock", "correction"]
  const adjustmentType = String(body.adjustment_type || "")
  if (!allowed.includes(adjustmentType)) {
    return NextResponse.json({ error: `Invalid adjustment type. Allowed: ${allowed.join(", ")}` }, { status: 400 })
  }

  const quantity = Number(body.quantity)
  const reason = body.reason || null

  const { data: product } = await supabase
    .from("products")
    .select("id, title, quantity")
    .eq("id", Number(id))
    .eq("business_id", bid)
    .single()

  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })

  let newQty = Number(product.quantity)

  if (adjustmentType === "damaged" || adjustmentType === "stolen") {
    if (quantity > newQty) {
      return NextResponse.json({ error: `Cannot ${adjustmentType} ${quantity} units. Only ${newQty} in stock.` }, { status: 400 })
    }
    newQty -= quantity
  } else if (adjustmentType === "returned" || adjustmentType === "restock") {
    newQty += quantity
  } else if (adjustmentType === "correction") {
    newQty = quantity
  }

  const { error: adjError } = await supabase.from("stock_adjustments").insert({
    product_id: Number(id),
    business_id: bid,
    adjustment_type: adjustmentType,
    quantity,
    reason,
    user_id: session.user_id,
  })

  if (adjError) return NextResponse.json({ error: adjError.message }, { status: 500 })

  const { error: updError } = await supabase
    .from("products")
    .update({ quantity: newQty, updated_at: new Date().toISOString() })
    .eq("id", Number(id))
    .eq("business_id", bid)

  if (updError) return NextResponse.json({ error: updError.message }, { status: 500 })

  await supabase.from("audit_log").insert({
    business_id: bid,
    user_id: session.user_id,
    username: session.username,
    action: "adjust",
    table_name: "products",
    record_id: Number(id),
    details: `Adjusted "${product.title}": ${adjustmentType} ${quantity} units (stock: ${newQty})`,
  })

  return NextResponse.json({ ok: true, new_quantity: newQty })
}
