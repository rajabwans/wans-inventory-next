import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET() {
  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const bid = session.business_id

  const [productsRes, customersRes, categoriesRes] = await Promise.all([
    supabase.from("products").select("*").eq("business_id", bid).order("title"),
    supabase.from("customers").select("*").eq("business_id", bid).order("name"),
    supabase.from("categories").select("*").eq("business_id", bid).order("name"),
  ])

  return NextResponse.json({
    products: productsRes.data || [],
    customers: customersRes.data || [],
    categories: categoriesRes.data || [],
    meta: { server_time: new Date().toISOString() },
  })
}
