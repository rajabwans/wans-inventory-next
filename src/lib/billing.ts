import { supabase } from "@/lib/supabase"

export interface PlanResult {
  plan: string
  status: string
  effective: string
  trial_ends_at: string | null
  paid_until: string | null
  upgrade_requested: boolean
  upgrade_note: string | null
  upgrade_proof: string | null
  upgrade_requested_at: string | null
}

export async function getEffectivePlan(businessId: number): Promise<PlanResult | null> {
  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .single()

  if (!data) return null

  const now = new Date()
  let effective = "expired"

  if (data.plan === "pro" && data.paid_until && new Date(data.paid_until) > now) {
    effective = "pro"
  } else if (data.trial_ends_at && new Date(data.trial_ends_at) > now) {
    effective = "trial"
  }

  return {
    plan: data.plan,
    status: data.status,
    effective,
    trial_ends_at: data.trial_ends_at,
    paid_until: data.paid_until,
    upgrade_requested: !!data.upgrade_requested,
    upgrade_note: data.upgrade_note,
    upgrade_proof: data.upgrade_proof,
    upgrade_requested_at: data.upgrade_requested_at,
  }
}

export const PRO_PRICE = process.env.PRO_PRICE || "UGX 15,000 / month"
export const PAYMENT_PHONE = process.env.PAYMENT_PHONE || "0763750114"
