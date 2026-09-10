import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { supabase } from "@/lib/supabase"
import { getEffectivePlan } from "@/lib/billing"

export const dynamic = "force-dynamic"

export async function GET() {
  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const bid = session.business_id
  const plan = await getEffectivePlan(bid)
  if (!plan) return NextResponse.json({ error: "Business not found" }, { status: 404 })

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, slug, currency, plan, status, paid_until, trial_ends_at, upgrade_requested, upgrade_note, upgrade_proof, upgrade_requested_at")
    .eq("id", bid)
    .single()

  return NextResponse.json({ business, plan })
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
  if (!body?.transaction_ref) {
    return NextResponse.json({ error: "Transaction reference is required" }, { status: 400 })
  }

  const now = new Date().toISOString()
  const { error } = await supabase
    .from("businesses")
    .update({
      upgrade_requested: 1,
      upgrade_note: JSON.stringify({ ref: body.transaction_ref, note: body.note || null }),
      upgrade_proof: null,
      upgrade_requested_at: now,
    })
    .eq("id", bid)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from("audit_log").insert({
    business_id: bid,
    user_id: session.user_id,
    username: session.username,
    action: "upgrade",
    table_name: "businesses",
    record_id: bid,
    details: `Upgrade requested ref=${body.transaction_ref}`,
  })

  return NextResponse.json({ ok: true })
}
