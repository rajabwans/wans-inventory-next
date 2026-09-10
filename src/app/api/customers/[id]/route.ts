import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { supabase } from "@/lib/supabase"
import { planGate } from "@/lib/planGate"

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
    .from("customers")
    .select("*")
    .eq("id", Number(id))
    .eq("business_id", bid)
    .single()

  if (error || !data) return NextResponse.json({ error: "Customer not found" }, { status: 404 })

  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
  const gate = await planGate(session)
  if (gate) return gate

  const bid = session.business_id
  const { id } = await params
  const body = await req.json().catch(() => null)

  const { data: existing } = await supabase
    .from("customers")
    .select("id")
    .eq("id", Number(id))
    .eq("business_id", bid)
    .single()

  if (!existing) return NextResponse.json({ error: "Customer not found" }, { status: 404 })

  const updateFields: Record<string, any> = {}
  if (body?.name !== undefined) updateFields.name = body.name
  if (body?.phone !== undefined) updateFields.phone = body.phone
  if (body?.email !== undefined) updateFields.email = body.email
  if (body?.address !== undefined) updateFields.address = body.address

  const { data, error } = await supabase
    .from("customers")
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
    table_name: "customers",
    record_id: Number(id),
    details: `Updated customer "${data.name}"`,
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
  const gate = await planGate(session)
  if (gate) return gate

  const bid = session.business_id
  const { id } = await params

  const { data: customer } = await supabase
    .from("customers")
    .select("name")
    .eq("id", Number(id))
    .eq("business_id", bid)
    .single()

  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 })

  const { error } = await supabase.from("customers").delete().eq("id", Number(id)).eq("business_id", bid)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from("audit_log").insert({
    business_id: bid,
    user_id: session.user_id,
    username: session.username,
    action: "delete",
    table_name: "customers",
    record_id: Number(id),
    details: `Deleted customer "${customer.name}"`,
  })

  return NextResponse.json({ ok: true })
}
