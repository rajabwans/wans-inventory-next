import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { supabase } from "@/lib/supabase"
import { generatePDF, headerTable, dataTable, fmt, footerLine } from "@/lib/pdf"
import { csv } from "@/lib/csv"

export const dynamic = "force-dynamic"

async function stockData(session: Awaited<ReturnType<typeof requireAuth>>) {
  const bid = session.business_id
  const { data } = await supabase
    .from("products")
    .select("title, category, quantity, buying_price, selling_price")
    .eq("business_id", bid)
    .order("category")
    .order("title")
  return (data || []) as any[]
}

function totals(rows: any[]) {
  return {
    total_products: rows.length,
    total_units: rows.reduce((s, r) => s + r.quantity, 0),
    total_value: rows.reduce((s, r) => s + r.buying_price * r.quantity, 0),
    potential_revenue: rows.reduce((s, r) => s + r.selling_price * r.quantity, 0),
    potential_profit: rows.reduce((s, r) => s + (r.selling_price - r.buying_price) * r.quantity, 0),
  }
}

export async function GET() {
  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("name, currency")
    .eq("id", session.business_id)
    .single()

  const name = business?.name || "WANPLAN"
  const currency = business?.currency || "UGX"
  const rows = await stockData(session)
  const t = totals(rows)

  const buf = await generatePDF((doc) => {
    headerTable(doc, name, "STOCK VALUATION REPORT", new Date().toISOString().slice(0, 16).replace("T", " "))
    dataTable(
      doc,
      [
        { label: "Product", align: "left" },
        { label: "Category", align: "left" },
        { label: "Qty", align: "right" },
        { label: "Unit Cost", align: "right" },
        { label: "Stock Value", align: "right" },
      ],
      rows.map((p) => [p.title, p.category || "-", p.quantity, fmt(p.buying_price, ""), fmt(p.buying_price * p.quantity, "")]),
      ["", "", t.total_units, "", fmt(t.total_value, currency)]
    )
    doc.moveDown(0.8)
    doc.fontSize(10).font("Helvetica")
    for (const line of [
      `Total Products: ${t.total_products}`,
      `Total Units: ${t.total_units}`,
      `Total Invested: ${fmt(t.total_value, currency)}`,
      `Potential Revenue: ${fmt(t.potential_revenue, currency)}`,
      `Potential Profit: ${fmt(t.potential_profit, currency)}`,
    ]) {
      doc.text(line)
    }
    footerLine(doc, name)
  })

  return new NextResponse(Buffer.from(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="stock_valuation_report.pdf"`,
    },
  })
}