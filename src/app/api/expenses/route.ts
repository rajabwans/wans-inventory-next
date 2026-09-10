import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { supabase } from "@/lib/supabase"
import { planGate } from "@/lib/planGate"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const bid = session.business_id
  const search = req.nextUrl.searchParams.get("search") || ""

  let query = supabase
    .from("expenses")
    .select("*")
    .eq("business_id", bid)
    .order("created_at", { ascending: false })

  if (search) {
    query = query.ilike("description", `%${search}%`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
  const gate = await planGate(session)
  if (gate) return gate

  const bid = session.business_id
  const body = await req.json().catch(() => null)
  if (!body?.description || !body?.amount) {
    return NextResponse.json({ error: "Description and amount are required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("expenses")
    .insert({
      business_id: bid,
      description: body.description,
      amount: Number(body.amount),
      category: body.category || null,
      user_id: session.user_id,
      expense_date: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from("audit_log").insert({
    business_id: bid,
    user_id: session.user_id,
    username: session.username,
    action: "create",
    table_name: "expenses",
    record_id: data.id,
    details: `Created expense "${body.description}" — UGX ${Number(body.amount).toLocaleString()}`,
  })

  return NextResponse.json(data, { status: 201 })
}
