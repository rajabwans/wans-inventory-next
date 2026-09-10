import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { supabase } from "@/lib/supabase"
import { hashPassword } from "@/lib/passwords"

export const dynamic = "force-dynamic"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  if (!["admin", "superadmin"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const bid = session.business_id
  const { id } = await params
  const userId = Number(id)
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .eq("business_id", bid)
    .single()

  if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const updates: Record<string, unknown> = {}
  if (body.full_name !== undefined) updates.full_name = body.full_name
  if (body.role !== undefined) updates.role = body.role
  if (body.password) updates.password_hash = await hashPassword(body.password)

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }

  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .eq("business_id", bid)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from("audit_log").insert({
    business_id: bid,
    user_id: session.user_id,
    username: session.username,
    action: "update",
    table_name: "users",
    record_id: userId,
    details: `Updated user ${userId}: ${Object.keys(updates).join(", ")}`,
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  if (!["admin", "superadmin"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const bid = session.business_id
  const { id } = await params
  const userId = Number(id)

  const { data: existing } = await supabase
    .from("users")
    .select("id, username")
    .eq("id", userId)
    .eq("business_id", bid)
    .single()

  if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 })

  if (userId === session.user_id) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 })
  }

  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", userId)
    .eq("business_id", bid)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from("audit_log").insert({
    business_id: bid,
    user_id: session.user_id,
    username: session.username,
    action: "delete",
    table_name: "users",
    record_id: userId,
    details: `Deleted user "${existing.username}"`,
  })

  return NextResponse.json({ ok: true })
}
