import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { supabase } from "@/lib/supabase"
import { csv } from "@/lib/csv"

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

  const { data: sales } = await supabase
    .from("sales")
    .select("total_amount, profit")
    .eq("business_id", bid)
    .gte("sale_date", from + "T00:00:00")
    .lte("sale_date", to + "T23:59:59")

  const { data: expenses } = await supabase
    .from("expenses")
    .select("amount, category")
    .eq("business_id", bid)
    .gte("expense_date", from + "T00:00:00")
    .lte("expense_date", to + "T23:59:59")

  const revenue = (sales || []).reduce((s: number, x: any) => s + x.total_amount, 0)
  const grossProfit = (sales || []).reduce((s: number, x: any) => s + x.profit, 0)
  const cogs = revenue - grossProfit
  const expensesTotal = (expenses || []).reduce((s: number, x: any) => s + x.amount, 0)
  const netProfit = grossProfit - expensesTotal

  const byCategory: Record<string, number> = {}
  for (const e of expenses || []) {
    const cat = e.category || "Uncategorized"
    byCategory[cat] = (byCategory[cat] || 0) + e.amount
  }

  const rows = [
    ["REVENUE", ""],
    ["Sales Revenue", revenue],
    ["", ""],
    ["COST OF GOODS SOLD", ""],
    ["Cost of Products Sold", cogs],
    ["", ""],
    ["GROSS PROFIT", grossProfit],
    ["", ""],
    ["OPERATING EXPENSES", ""],
    ...Object.entries(byCategory).map(([cat, amt]) => [`  ${cat}`, amt]),
    ["Total Expenses", expensesTotal],
    ["", ""],
    ["NET PROFIT", netProfit],
  ]

  const body = csv(["Item", "Amount"], rows)

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="profit_loss_report.csv"`,
    },
  })
}