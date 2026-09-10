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

  const { data: purchases, error } = await supabase
    .from("purchases")
    .select("*, suppliers(name)")
    .eq("business_id", bid)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const result = (purchases || []).map((p: any) => ({
    ...p,
    supplier_name: p.suppliers?.name || "Unknown",
  }))

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const bid = session.business_id
  const body = await req.json().catch(() => null)
  if (!body?.items || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "At least one item is required" }, { status: 400 })
  }

  const items = body.items as Array<{ product_id: number; quantity: number; unit_cost: number; expiry_date?: string }>

  for (const item of items) {
    if (!item.product_id || !item.quantity || item.quantity <= 0) {
      return NextResponse.json({ error: "Each item must have product_id and quantity > 0" }, { status: 400 })
    }
    const { data: product, error: prodErr } = await supabase
      .from("products")
      .select("id")
      .eq("id", Number(item.product_id))
      .eq("business_id", bid)
      .single()
    if (prodErr || !product) {
      return NextResponse.json({ error: `Product ${item.product_id} not found` }, { status: 404 })
    }
  }

  const totalAmount = items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_cost), 0)

  const { data: purchase, error: purchaseErr } = await supabase
    .from("purchases")
    .insert({
      business_id: bid,
      supplier_id: body.supplier_id ? Number(body.supplier_id) : null,
      purchase_date: body.purchase_date || new Date().toISOString(),
      total_amount: totalAmount,
      note: body.note || null,
      created_by: session.username,
    })
    .select()
    .single()

  if (purchaseErr) return NextResponse.json({ error: purchaseErr.message }, { status: 500 })

  for (const item of items) {
    const qty = Number(item.quantity)
    const unitCost = Number(item.unit_cost)
    const lineTotal = qty * unitCost

    await supabase.from("purchase_items").insert({
      business_id: bid,
      purchase_id: purchase.id,
      product_id: Number(item.product_id),
      quantity: qty,
      unit_cost: unitCost,
      line_total: lineTotal,
      expiry_date: item.expiry_date || null,
    })

    const { data: product } = await supabase
      .from("products")
      .select("quantity, buying_price")
      .eq("id", Number(item.product_id))
      .eq("business_id", bid)
      .single()

    if (product) {
      await supabase
        .from("products")
        .update({
          quantity: product.quantity + qty,
          buying_price: unitCost,
          updated_at: new Date().toISOString(),
        })
        .eq("id", Number(item.product_id))
        .eq("business_id", bid)
    }

    await supabase.from("product_batches").insert({
      business_id: bid,
      product_id: Number(item.product_id),
      quantity: qty,
      unit_cost: unitCost,
      expiry_date: item.expiry_date || null,
      received_date: body.purchase_date || new Date().toISOString(),
      source: "purchase",
      source_id: purchase.id,
    })

    await supabase.from("stock_adjustments").insert({
      business_id: bid,
      product_id: Number(item.product_id),
      adjustment_type: "restock",
      quantity: qty,
      reason: "Purchase",
      user_id: session.user_id,
    })
  }

  await supabase.from("audit_log").insert({
    business_id: bid,
    user_id: session.user_id,
    username: session.username,
    action: "create",
    table_name: "purchases",
    record_id: purchase.id,
    details: `Created purchase #${purchase.id} with ${items.length} items, total ${totalAmount}`,
  })

  return NextResponse.json({ id: purchase.id, total_amount: totalAmount }, { status: 201 })
}
