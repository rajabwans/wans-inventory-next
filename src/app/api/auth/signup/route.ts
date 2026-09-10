import { NextResponse } from "next/server"
import { hashPassword } from "@/lib/passwords"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const businessName = String(body?.businessName ?? "").trim()
  const slug = String(body?.slug ?? "").trim().toLowerCase()
  const username = String(body?.username ?? "").trim()
  const fullName = String(body?.fullName ?? "").trim()
  const password = String(body?.password ?? "")

  if (!businessName || !slug || !username || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
  }
  if (!/^[a-z0-9]{3,30}$/.test(slug)) {
    return NextResponse.json({ error: "Slug must be 3-30 lowercase letters/numbers only" }, { status: 400 })
  }

  // Slug check
  const { data: existingSlug } = await supabase
    .from("businesses")
    .select("id")
    .eq("slug", slug)
    .maybeSingle()
  if (existingSlug) {
    return NextResponse.json({ error: "That business slug is already taken" }, { status: 409 })
  }

  const passwordHash = await hashPassword(password)

  // Create business (pending approval)
  const { data: business, error: bizErr } = await supabase
    .from("businesses")
    .insert({
      name: businessName,
      slug,
      status: "pending",
      plan: "trial",
    })
    .select()
    .single()

  if (bizErr || !business) {
    return NextResponse.json({ error: bizErr?.message || "Could not create business" }, { status: 500 })
  }

  // Create admin user
  const { data: user, error: userErr } = await supabase
    .from("users")
    .insert({
      business_id: business.id,
      username,
      password_hash: passwordHash,
      full_name: fullName,
      role: "admin",
    })
    .select()
    .single()

  if (userErr || !user) {
    // Roll back business
    await supabase.from("businesses").delete().eq("id", business.id)
    return NextResponse.json({ error: userErr?.message || "Could not create user" }, { status: 500 })
  }

  // Seed default categories
  const productCats = ["Perfumes", "Scented Oils", "Toys", "Womens Bags", "Suitcases"]
  const expenseCats = ["Rent", "Utilities", "Transport", "Salaries", "Marketing", "Other"]
  const cats = [...productCats.map((name) => ({ business_id: business.id, name, kind: "product" })),
                ...expenseCats.map((name) => ({ business_id: business.id, name, kind: "expense" }))]
  await supabase.from("categories").insert(cats)

  return NextResponse.json({
    ok: true,
    message: "Your account was created and is awaiting platform approval. You'll receive a trial once approved.",
  })
}