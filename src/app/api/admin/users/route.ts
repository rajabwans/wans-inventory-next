import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { supabase } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

export async function GET() {
  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const bid = session.business_id

  const { data, error } = await supabase
    .from("users")
    .select("id, username, full_name, role, created_at")
    .eq("business_id", bid)
    .order("created_at", { ascending: false })

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

  const bid = session.business_id
  const body = await req.json().catch(() => null)
  if (!body?.username || !body?.password || !body?.full_name) {
    return NextResponse.json({ error: "Username, full name, and password are required" }, { status: 400 })
  }

  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("business_id", bid)

  const planResult = await import("@/lib/billing").then((m) => m.getEffectivePlan(bid))
  if (planResult?.effective === "trial" && (count || 0) >= 2) {
    return NextResponse.json({ error: "Trial plan allows maximum 2 users" }, { status: 409 })
  }

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("business_id", bid)
    .eq("username", body.username)
    .single()

  if (existing) {
    return NextResponse.json({ error: "Username already exists" }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(body.password, 12)

  const { data, error } = await supabase
    .from("users")
    .insert({
      business_id: bid,
      username: body.username,
      full_name: body.full_name,
      role: body.role || "staff",
      password_hash: passwordHash,
    })
    .select("id, username, full_name, role, created_at")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from("audit_log").insert({
    business_id: bid,
    user_id: session.user_id,
    username: session.username,
    action: "create",
    table_name: "users",
    record_id: data.id,
    details: `Created user "${body.username}"`,
  })

  return NextResponse.json(data, { status: 201 })
}
