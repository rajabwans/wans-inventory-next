import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
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

  const { data: business } = await supabase
    .from("businesses")
    .select("upgrade_proof")
    .eq("id", body.id)
    .single()

  if (business?.upgrade_proof) {
    try {
      fs.unlinkSync(path.join(process.cwd(), "uploads", path.basename(business.upgrade_proof)))
    } catch {
      // ignore
    }
  }

  const { error } = await supabase
    .from("businesses")
    .update({
      upgrade_requested: 0,
      upgrade_note: null,
      upgrade_proof: null,
    })
    .eq("id", body.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from("audit_log").insert({
    business_id: body.id,
    user_id: session.user_id,
    username: session.username,
    action: "clear-upgrade",
    table_name: "businesses",
    record_id: body.id,
    details: `Cleared upgrade request for business ${body.id}`,
  })

  return NextResponse.json({ ok: true })
}
