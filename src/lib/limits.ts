import { supabase } from "@/lib/supabase"
import { getBusinessById, getEffectivePlan, PLAN_LIMITS } from "@/lib/auth"

export type LimitKind = "products" | "customers" | "users"

export interface LimitResult {
  allowed: boolean
  current: number
  limit: number
  plan: "trial" | "pro" | "expired"
}

export async function checkLimit(businessId: number, kind: LimitKind): Promise<LimitResult> {
  const business = await getBusinessById(businessId)
  const plan = getEffectivePlan(business ?? { plan: "", paid_until: null, trial_ends_at: null })
  const cap = PLAN_LIMITS[plan][kind]

  let current = 0
  if (cap !== Infinity) {
    const { count } = await supabase
      .from(kind)
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
    current = count || 0
  }

  return { allowed: current < cap, current, limit: cap === Infinity ? -1 : cap, plan }
}