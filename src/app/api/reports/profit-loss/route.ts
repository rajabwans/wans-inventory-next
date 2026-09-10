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
  const now = new Date()
  const defaultFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
  const defaultTo = now.toISOString().slice(0, 10)
  const from = req.nextUrl.searchParams.get("from") || defaultFrom
  const to = req.nextUrl.searchParams.get("to") || defaultTo

  const { data: sales, error: salesErr } = await supabase
    .from("sales")
    .select("total_amount, profit")
    .eq("business_id", bid)
    .gte("sale_date", from + "T00:00:00")
    .lte("sale_date", to + "T23:59:59")

  if (salesErr) return NextResponse.json({ error: salesErr.message }, { status: 500 })

  const revenue = (sales || []).reduce((sum: number, s: any) => sum + s.total_amount, 0)
  const grossProfit = (sales || []).reduce((sum: number, s: any) => sum + s.profit, 0)
  const cogs = revenue - grossProfit

  const { data: expenses, error: expErr } = await supabase
    .from("expenses")
    .select("amount, category")
    .eq("business_id", bid)
    .gte("expense_date", from + "T00:00:00")
    .lte("expense_date", to + "T23:59:59")

  if (expErr) return NextResponse.json({ error: expErr.message }, { status: 500 })

  const expensesTotal = (expenses || []).reduce((sum: number, e: any) => sum + e.amount, 0)

  const byCategory: Record<string, number> = {}
  for (const e of expenses || []) {
    const cat = e.category || "Uncategorized"
    byCategory[cat] = (byCategory[cat] || 0) + e.amount
  }

  const categoryBreakdown = Object.entries(byCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)

  const netProfit = grossProfit - expensesTotal

  return NextResponse.json({
    from,
    to,
    revenue,
    cogs,
    gross_profit: grossProfit,
    expenses_total: expensesTotal,
    category_breakdown: categoryBreakdown,
    net_profit: netProfit,
  })
}
