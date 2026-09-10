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

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", Number(id))
    .eq("business_id", bid)
    .single()

  if (error || !data) return NextResponse.json({ error: "Product not found" }, { status: 404 })

  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const bid = session.business_id
  const { id } = await params
  const body = await req.json().catch(() => null)

  const { data: current } = await supabase
    .from("products")
    .select("version")
    .eq("id", Number(id))
    .eq("business_id", bid)
    .single()

  if (!current) return NextResponse.json({ error: "Product not found" }, { status: 404 })

  const updateFields: Record<string, any> = { updated_at: new Date().toISOString() }
  if (body?.title !== undefined) updateFields.title = body.title
  if (body?.category !== undefined) updateFields.category = body.category
  if (body?.quantity !== undefined) updateFields.quantity = Number(body.quantity)
  if (body?.buying_price !== undefined) updateFields.buying_price = Number(body.buying_price)
  if (body?.selling_price !== undefined) updateFields.selling_price = Number(body.selling_price)
  if (body?.notes !== undefined) updateFields.notes = body.notes
  if (body?.expiry_date !== undefined) updateFields.expiry_date = body.expiry_date

  updateFields.version = (current.version || 0) + 1

  const { data, error } = await supabase
    .from("products")
    .update(updateFields)
    .eq("id", Number(id))
    .eq("business_id", bid)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from("audit_log").insert({
    business_id: bid,
    user_id: session.user_id,
    username: session.username,
    action: "update",
    table_name: "products",
    record_id: Number(id),
    details: `Updated product "${data.title}"`,
  })

  return NextResponse.json(data)
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

  const { data: product } = await supabase
    .from("products")
    .select("title")
    .eq("id", Number(id))
    .eq("business_id", bid)
    .single()

  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })

  await supabase.from("stock_adjustments").delete().eq("product_id", Number(id)).eq("business_id", bid)

  const { error } = await supabase.from("products").delete().eq("id", Number(id)).eq("business_id", bid)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from("audit_log").insert({
    business_id: bid,
    user_id: session.user_id,
    username: session.username,
    action: "delete",
    table_name: "products",
    record_id: Number(id),
    details: `Deleted product "${product.title}"`,
  })

  return NextResponse.json({ ok: true })
}
