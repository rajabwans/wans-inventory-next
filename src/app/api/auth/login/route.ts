import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { createSession } from "@/lib/session"
import { verifyPassword } from "@/lib/passwords"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const slug = String(body?.slug ?? "").trim().toLowerCase()
  const username = String(body?.username ?? "").trim()
  const password = String(body?.password ?? "")

  if (!slug || !username || !password) {
    return NextResponse.json({ error: "Please enter slug, username and password" }, { status: 400 })
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 401 })
  }

  if (business.status === "suspended") {
    return NextResponse.json({ error: "This business account is suspended. Contact support." }, { status: 403 })
  }
  if (business.status === "rejected") {
    return NextResponse.json({ error: "This business account was rejected." }, { status: 403 })
  }
  if (business.status === "pending") {
    return NextResponse.json({ error: "This account is still pending approval from the platform admin." }, { status: 403 })
  }

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("business_id", business.id)
    .eq("username", username)
    .single()

  if (!user) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
  }

  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
  }

  await createSession(user.id, business.id, user.username, user.role)

  return NextResponse.json({ ok: true, redirect: "/dashboard" })
}