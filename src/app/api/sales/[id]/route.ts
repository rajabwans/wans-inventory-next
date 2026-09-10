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

  const { data: sale, error } = await supabase
    .from("sales")
    .select("*, products(title), customers(name)")
    .eq("id", Number(id))
    .eq("business_id", bid)
    .single()

  if (error || !sale) return NextResponse.json({ error: "Sale not found" }, { status: 404 })

  const { data: payments } = await supabase
    .from("sale_payments")
    .select("*")
    .eq("sale_id", Number(id))
    .eq("business_id", bid)
    .order("paid_at", { ascending: true })

  return NextResponse.json({
    ...sale,
    product_title: (sale as any).products?.title || "",
    customer_display: (sale as any).customers?.name || sale.customer_name || "Walk-in",
    payments: payments || [],
  })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const bid = session.business_id
  const { id } = await params

  const { data: sale } = await supabase
    .from("sales")
    .select("*")
    .eq("id", Number(id))
    .eq("business_id", bid)
    .single()

  if (!sale) return NextResponse.json({ error: "Sale not found" }, { status: 404 })

  const { data: product } = await supabase
    .from("products")
    .select("buying_price")
    .eq("id", sale.product_id)
    .eq("business_id", bid)
    .single()

  const buyingPrice = (product as any)?.buying_price || 0

  await supabase.from("sale_payments").delete().eq("sale_id", sale.id).eq("business_id", bid)
  await supabase.from("sale_returns").delete().eq("sale_id", sale.id).eq("business_id", bid)

  await supabase
    .from("products")
    .update({ quantity: (await supabase.from("products").select("quantity").eq("id", sale.product_id).eq("business_id", bid).single()).data!.quantity + sale.quantity_sold, updated_at: new Date().toISOString() })
    .eq("id", sale.product_id)
    .eq("business_id", bid)

  await supabase.from("product_batches").insert({
    business_id: bid,
    product_id: sale.product_id,
    quantity: sale.quantity_sold,
    unit_cost: buyingPrice,
    source: "manual",
    created_at: new Date().toISOString(),
  })

  const { error } = await supabase.from("sales").delete().eq("id", sale.id).eq("business_id", bid)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from("audit_log").insert({
    business_id: bid,
    user_id: session.user_id,
    username: session.username,
    action: "delete",
    table_name: "sales",
    record_id: sale.id,
    details: `Deleted sale #${sale.id}`,
  })

  return NextResponse.json({ ok: true })
}
