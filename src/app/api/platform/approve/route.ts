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

  const now = new Date()
  const trialEnds = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from("businesses")
    .update({
      status: "active",
      is_active: true,
      trial_ends_at: trialEnds,
    })
    .eq("id", body.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from("audit_log").insert({
    business_id: body.id,
    user_id: session.user_id,
    username: session.username,
    action: "approve",
    table_name: "businesses",
    record_id: body.id,
    details: `Approved business ${body.id}`,
  })

  return NextResponse.json({ ok: true })
}
