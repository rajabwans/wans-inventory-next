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

  const { data: sales, error } = await supabase
    .from("sales")
    .select("*, products(title), customers(name)")
    .eq("business_id", bid)
    .order("sale_date", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const result = (sales || []).map((s: any) => ({
    ...s,
    product_title: s.products?.title || "",
    customer_display: s.customers?.name || s.customer_name || "Walk-in",
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
  if (!body?.product_id || !body?.quantity_sold) {
    return NextResponse.json({ error: "product_id and quantity_sold are required" }, { status: 400 })
  }

  const { data: product, error: prodErr } = await supabase
    .from("products")
    .select("*")
    .eq("id", Number(body.product_id))
    .eq("business_id", bid)
    .single()

  if (prodErr || !product) return NextResponse.json({ error: "Product not found" }, { status: 404 })

  const quantitySold = Number(body.quantity_sold)
  if (product.quantity < quantitySold) {
    return NextResponse.json({ error: `Not enough stock for ${product.title}` }, { status: 400 })
  }

  const unitPrice = Number(body.unit_price) || product.selling_price
  const totalAmount = unitPrice * quantitySold
  const profit = (unitPrice - product.buying_price) * quantitySold
  const amountPaid = Number(body.amount_paid) || 0
  const paymentMethod = body.payment_method || "cash"
  const paymentStatus = paymentMethod === "credit" ? "unpaid" : amountPaid >= totalAmount ? "paid" : amountPaid > 0 ? "partial" : "unpaid"

  const { data: sale, error: saleErr } = await supabase
    .from("sales")
    .insert({
      business_id: bid,
      product_id: Number(body.product_id),
      customer_id: body.customer_id ? Number(body.customer_id) : null,
      customer_name: body.customer_name || null,
      quantity_sold: quantitySold,
      unit_price: unitPrice,
      total_amount: totalAmount,
      profit,
      payment_status: paymentStatus,
      amount_paid: amountPaid,
      payment_method: paymentMethod,
      due_date: body.due_date || null,
      sale_date: body.sale_date || new Date().toISOString(),
    })
    .select()
    .single()

  if (saleErr) return NextResponse.json({ error: saleErr.message }, { status: 500 })

  if (amountPaid > 0) {
    await supabase.from("sale_payments").insert({
      business_id: bid,
      sale_id: sale.id,
      amount: amountPaid,
      method: paymentMethod,
      note: null,
      recorded_by: session.username,
    })
  }

  let remaining = quantitySold
  const { data: batches } = await supabase
    .from("product_batches")
    .select("*")
    .eq("business_id", bid)
    .eq("product_id", Number(body.product_id))
    .gt("quantity", 0)
    .order("expiry_date", { ascending: true })
    .order("created_at", { ascending: true })

  for (const batch of batches || []) {
    if (remaining <= 0) break
    const take = Math.min(batch.quantity, remaining)
    remaining -= take
    await supabase
      .from("product_batches")
      .update({ quantity: batch.quantity - take })
      .eq("id", batch.id)
  }

  await supabase
    .from("products")
    .update({ quantity: product.quantity - quantitySold, updated_at: new Date().toISOString() })
    .eq("id", product.id)

  await supabase.from("audit_log").insert({
    business_id: bid,
    user_id: session.user_id,
    username: session.username,
    action: "create",
    table_name: "sales",
    record_id: sale.id,
    details: `Created sale of ${quantitySold}x ${product.title}`,
  })

  return NextResponse.json({ id: sale.id, total_amount: totalAmount, profit }, { status: 201 })
}
