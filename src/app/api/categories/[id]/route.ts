import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { supabase } from "@/lib/supabase"
import { planGate } from "@/lib/planGate"

export const dynamic = "force-dynamic"

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

  const { data: cat } = await supabase
    .from("categories")
    .select("name")
    .eq("id", Number(id))
    .eq("business_id", bid)
    .single()

  if (!cat) return NextResponse.json({ error: "Category not found" }, { status: 404 })

  const { error } = await supabase.from("categories").delete().eq("id", Number(id)).eq("business_id", bid)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from("audit_log").insert({
    business_id: bid,
    user_id: session.user_id,
    username: session.username,
    action: "delete",
    table_name: "categories",
    record_id: Number(id),
    details: `Deleted category "${cat.name}"`,
  })

  return NextResponse.json({ ok: true })
}
