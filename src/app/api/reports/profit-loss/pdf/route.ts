import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { supabase } from "@/lib/supabase"
import { generatePDF, headerTable, footerLine, fmt } from "@/lib/pdf"

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

  const { data: business } = await supabase
    .from("businesses")
    .select("name, currency")
    .eq("id", bid)
    .single()

  const name = business?.name || "WANPLAN"
  const currency = business?.currency || "UGX"
  const F = (n: number) => fmt(n, currency)

  const buf = await generatePDF((doc) => {
    headerTable(doc, name, "PROFIT & LOSS STATEMENT", `Period: ${from} to ${to}`)
    doc.moveDown(0.6)
    const y0 = doc.y + 4
    const line = (label: string, amount: string, bold = false, fill?: string) => {
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(10)
      if (fill) {
        doc.save().fillColor(fill).rect(40, doc.y, 515, 20).fill().restore()
      }
      doc.fillColor("#111827").text(label, 48, doc.y + 5, { width: 300 })
      doc.text(amount, 348, doc.y < y0 ? y0 + 5 : doc.y + 5, { width: 200, align: "right" })
      doc.moveDown(0.5)
    }
    line("REVENUE", "", true)
    line("  Sales Revenue", F(revenue))
    line("", "")
    line("COST OF GOODS SOLD", "", true)
    line("  Cost of Products Sold", F(cogs))
    line("", "")
    line("GROSS PROFIT", F(grossProfit), true)
    line("", "")
    line("OPERATING EXPENSES", "", true)
    for (const [cat, amt] of Object.entries(byCategory)) {
      line(`  ${cat}`, F(amt))
    }
    line("  Total Expenses", F(expensesTotal))
    line("", "")
    line("NET PROFIT", F(netProfit), true, netProfit >= 0 ? "#d4edda" : "#f8d7da")
    footerLine(doc, name)
  })

  return new NextResponse(Buffer.from(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="profit_loss_report.pdf"`,
    },
  })
}