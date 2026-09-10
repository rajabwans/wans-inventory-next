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

  const bid = session.business_id
  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Request body required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("till_closures")
    .insert({
      business_id: bid,
      close_date: new Date().toISOString().slice(0, 10),
      cash_counted: Number(body.cash_counted) || 0,
      momo_counted: Number(body.momo_counted) || 0,
      card_counted: Number(body.card_counted) || 0,
      note: body.note || null,
      closed_by: session.user_id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from("audit_log").insert({
    business_id: bid,
    user_id: session.user_id,
    username: session.username,
    action: "till",
    table_name: "till_closures",
    record_id: data.id,
    details: `Till closed — Cash: UGX ${Number(body.cash_counted || 0).toLocaleString()}, MoMo: UGX ${Number(body.momo_counted || 0).toLocaleString()}, Card: UGX ${Number(body.card_counted || 0).toLocaleString()}`,
  })

  return NextResponse.json(data, { status: 201 })
}
