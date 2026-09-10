import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { getBusinessById, getEffectivePlan } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  if (session.role === "superadmin") {
    return NextResponse.json({ role: session.role, status: "active", effective: "pro" })
  }

  const business = await getBusinessById(session.business_id)
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })

  return NextResponse.json({
    role: session.role,
    status: business.status || "active",
    effective: getEffectivePlan(business),
  })
}