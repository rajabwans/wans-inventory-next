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
  const kind = req.nextUrl.searchParams.get("kind") || ""

  let query = supabase.from("categories").select("*").eq("business_id", bid).order("name")

  if (kind) {
    query = query.eq("kind", kind)
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
  if (!body?.name || !body?.kind) {
    return NextResponse.json({ error: "Name and kind are required" }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("business_id", bid)
    .eq("kind", body.kind)
    .eq("name", body.name)
    .limit(1)

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: "Category already exists" }, { status: 409 })
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({ business_id: bid, name: body.name, kind: body.kind })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
