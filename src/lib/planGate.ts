import { getBusinessById, getEffectivePlan } from "@/lib/auth"
import type { SessionData } from "@/lib/session"
import { NextResponse } from "next/server"

export async function planBlockReason(session: SessionData): Promise<string | null> {
  if (session.role === "superadmin") return null

  const business = await getBusinessById(session.business_id)
  if (!business) return "Business not found"

  if (business.status === "pending") {
    return "Your business is still awaiting approval."
  }

  const plan = getEffectivePlan(business)
  if (plan === "expired") {
    return "Your free trial has ended. Activate Pro to continue using WANPLAN."
  }

  return null
}

export async function planGate(session: SessionData): Promise<NextResponse | null> {
  const reason = await planBlockReason(session)
  return reason ? NextResponse.json({ error: reason }, { status: 403 }) : null
}