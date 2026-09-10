import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { supabase } from "@/lib/supabase"
import { planGate } from "@/lib/planGate"

export const dynamic = "force-dynamic"

export async function GET() {
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
  const { data, error } = await supabase
    .from("businesses")
    .select("id, name, slug, currency, logo, about, plan, status")
    .eq("id", bid)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
  const gate = await planGate(session)
  if (gate) return gate

  if (!["admin", "superadmin"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const bid = session.business_id
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

  const updates: Record<string, unknown> = {}
  if (body.name !== undefined) updates.name = body.name
  if (body.currency !== undefined) updates.currency = body.currency
  if (body.logo !== undefined) updates.logo = body.logo
  if (body.about !== undefined) updates.about = body.about

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }

  const { error } = await supabase
    .from("businesses")
    .update(updates)
    .eq("id", bid)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from("audit_log").insert({
    business_id: bid,
    user_id: session.user_id,
    username: session.username,
    action: "update",
    table_name: "businesses",
    record_id: bid,
    details: `Updated business: ${Object.keys(updates).join(", ")}`,
  })

  return NextResponse.json({ ok: true })
}
