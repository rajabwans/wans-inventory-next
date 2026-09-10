import { supabase } from "./supabase"

export interface User {
  id: number
  business_id: number
  username: string
  full_name: string | null
  role: string
}

export interface Business {
  id: number
  name: string
  slug: string
  currency: string
  plan: string
  status: string
  paid_until: string | null
  trial_ends_at: string | null
  is_active: boolean
  about: string | null
  logo: string | null
}

export function getEffectivePlan(business: Pick<Business, "plan" | "paid_until" | "trial_ends_at">): "trial" | "pro" | "expired" {
  const now = new Date()

  if (business.plan === "pro" && business.paid_until) {
    const paidUntil = new Date(business.paid_until)
    if (paidUntil > now) return "pro"
    return "expired"
  }

  if (business.trial_ends_at) {
    const trialEnds = new Date(business.trial_ends_at)
    if (trialEnds > now) return "trial"
  }

  return "expired"
}

export const PLAN_LIMITS = {
  trial: { products: 50, users: 2, customers: 100 },
  pro: { products: Infinity, users: Infinity, customers: Infinity },
  expired: { products: 0, users: 0, customers: 0 },
}

export async function getBusinessById(id: number): Promise<Business | null> {
  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .single()

  return (data as unknown as Business) ?? null
}

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .single()

  return (data as unknown as Business) ?? null
}

export function isSuperadmin(role: string) {
  return role === "superadmin"
}

export function isAdmin(role: string) {
  return role === "admin" || role === "superadmin"
}

export function currency(business: Pick<Business, "currency">): string {
  return business.currency || "UGX"
}

export function formatMoney(amount: number, cur: string = "UGX"): string {
  const n = Number(amount) || 0
  return `${cur} ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
}