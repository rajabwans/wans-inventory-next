import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { supabase } from "@/lib/supabase"
import { planGate } from "@/lib/planGate"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const bid = session.business_id

  const { data: returns, error } = await supabase
    .from("sale_returns")
    .select("*, sales(quantity_sold, unit_price, total_amount, amount_paid, payment_status), products(title)")
    .eq("business_id", bid)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const result = (returns || []).map((r: any) => ({
    ...r,
    product_title: r.products?.title || "Deleted product",
    sale_quantity_sold: r.sales?.quantity_sold || 0,
    sale_unit_price: r.sales?.unit_price || 0,
    sale_total_amount: r.sales?.total_amount || 0,
    sale_amount_paid: r.sales?.amount_paid || 0,
    sale_payment_status: r.sales?.payment_status || "",
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
  const gate = await planGate(session)
  if (gate) return gate

  const bid = session.business_id
  const body = await req.json().catch(() => null)
  if (!body?.sale_id || !body?.items || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "sale_id and at least one item are required" }, { status: 400 })
  }

  const { data: sale, error: saleErr } = await supabase
    .from("sales")
    .select("*")
    .eq("id", Number(body.sale_id))
    .eq("business_id", bid)
    .single()

  if (saleErr || !sale) return NextResponse.json({ error: "Sale not found" }, { status: 404 })

  const items = body.items as Array<{ product_id: number; quantity_returned: number; refund_amount?: number; reason?: string }>

  for (const item of items) {
    if (!item.product_id || !item.quantity_returned || item.quantity_returned <= 0) {
      return NextResponse.json({ error: "Each item must have product_id and quantity_returned > 0" }, { status: 400 })
    }

    const { data: existingReturns } = await supabase
      .from("sale_returns")
      .select("quantity_returned")
      .eq("sale_id", Number(body.sale_id))
      .eq("product_id", Number(item.product_id))
      .eq("business_id", bid)

    const priorReturned = (existingReturns || []).reduce((sum: number, r: any) => sum + r.quantity_returned, 0)
    const newQty = Number(item.quantity_returned)

    if (priorReturned + newQty > sale.quantity_sold) {
      return NextResponse.json({ error: "Return quantity exceeds sold quantity" }, { status: 400 })
    }
  }

  for (const item of items) {
    const qty = Number(item.quantity_returned)
    const refundAmount = Number(item.refund_amount) || 0

    await supabase.from("sale_returns").insert({
      business_id: bid,
      sale_id: Number(body.sale_id),
      product_id: Number(item.product_id),
      quantity_sold: sale.quantity_sold,
      quantity_returned: qty,
      refund_amount: refundAmount,
      reason: item.reason || null,
      created_by: session.username,
    })

    const { data: product } = await supabase
      .from("products")
      .select("quantity")
      .eq("id", Number(item.product_id))
      .eq("business_id", bid)
      .single()

    if (product) {
      await supabase
        .from("products")
        .update({ quantity: product.quantity + qty, updated_at: new Date().toISOString() })
        .eq("id", Number(item.product_id))
        .eq("business_id", bid)
    }

    await supabase.from("product_batches").insert({
      business_id: bid,
      product_id: Number(item.product_id),
      quantity: qty,
      unit_cost: 0,
      expiry_date: null,
      received_date: new Date().toISOString(),
      source: "manual",
      source_id: null,
    })

    await supabase.from("stock_adjustments").insert({
      business_id: bid,
      product_id: Number(item.product_id),
      adjustment_type: "returned",
      quantity: qty,
      reason: "Sale return",
      user_id: session.user_id,
    })
  }

  const { data: allReturns } = await supabase
    .from("sale_returns")
    .select("quantity_returned, refund_amount")
    .eq("sale_id", Number(body.sale_id))
    .eq("business_id", bid)

  const totalReturned = (allReturns || []).reduce((sum: number, r: any) => sum + r.quantity_returned, 0)
  const totalRefunded = (allReturns || []).reduce((sum: number, r: any) => sum + (Number(r.refund_amount) || 0), 0)

  if (totalReturned >= sale.quantity_sold && totalRefunded >= sale.amount_paid) {
    await supabase
      .from("sales")
      .update({ payment_status: "refunded" })
      .eq("id", Number(body.sale_id))
      .eq("business_id", bid)
  }

  await supabase.from("audit_log").insert({
    business_id: bid,
    user_id: session.user_id,
    username: session.username,
    action: "return",
    table_name: "sale_returns",
    record_id: Number(body.sale_id),
    details: `Return processed for sale #${body.sale_id}, ${items.length} items`,
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}
