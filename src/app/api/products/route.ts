import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { supabase } from "@/lib/supabase"

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

  let query = supabase.from("products").select("*").eq("business_id", bid).order("created_at", { ascending: false })

  if (search) {
    query = query.ilike("title", `%${search}%`)
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

  const bid = session.business_id
  const body = await req.json().catch(() => null)
  if (!body?.title) return NextResponse.json({ error: "Title is required" }, { status: 400 })

  const { data, error } = await supabase
    .from("products")
    .insert({
      business_id: bid,
      title: body.title,
      category: body.category || null,
      quantity: Number(body.quantity) || 0,
      buying_price: Number(body.buying_price) || 0,
      selling_price: Number(body.selling_price) || 0,
      notes: body.notes || null,
      expiry_date: body.expiry_date || null,
      version: 1,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from("audit_log").insert({
    business_id: bid,
    user_id: session.user_id,
    username: session.username,
    action: "create",
    table_name: "products",
    record_id: data.id,
    details: `Created product "${body.title}"`,
  })

  return NextResponse.json(data, { status: 201 })
}
