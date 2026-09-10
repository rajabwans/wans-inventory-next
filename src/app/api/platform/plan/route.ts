import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  if (session.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.id) return NextResponse.json({ error: "Business ID is required" }, { status: 400 })

  const updates: Record<string, unknown> = {
    plan: body.plan || "pro",
    upgrade_requested: 0,
    upgrade_note: null,
    upgrade_proof: null,
  }

  if (body.paid_until !== undefined) updates.paid_until = body.paid_until
  if (body.trial_ends_at !== undefined) updates.trial_ends_at = body.trial_ends_at

  const { error } = await supabase
    .from("businesses")
    .update(updates)
    .eq("id", body.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from("audit_log").insert({
    business_id: body.id,
    user_id: session.user_id,
    username: session.username,
    action: "plan",
    table_name: "businesses",
    record_id: body.id,
    details: `Set plan=${updates.plan} for business ${body.id}`,
  })

  return NextResponse.json({ ok: true })
}
