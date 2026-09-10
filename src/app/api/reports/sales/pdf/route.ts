import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { supabase } from "@/lib/supabase"
import { generatePDF, headerTable, dataTable, fmt, footerLine } from "@/lib/pdf"

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

  const { data: sales, error } = await supabase
    .from("sales")
    .select("*, products(title), customers(name)")
    .eq("business_id", bid)
    .gte("sale_date", from + "T00:00:00")
    .lte("sale_date", to + "T23:59:59")
    .order("sale_date", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = (sales || []).map((s: any) => ({
    sale_date: s.sale_date,
    title: s.products?.title || "",
    customer: s.customers?.name || s.customer_name || "Walk-in",
    qty: s.quantity_sold,
    total_amount: s.total_amount,
    profit: s.profit,
  }))

  const totalAmount = rows.reduce((s, r) => s + r.total_amount, 0)
  const totalProfit = rows.reduce((s, r) => s + r.profit, 0)

  const { data: business } = await supabase
    .from("businesses")
    .select("name, currency")
    .eq("id", bid)
    .single()

  const name = business?.name || "WANPLAN"
  const currency = business?.currency || "UGX"

  const buf = await generatePDF((doc) => {
    headerTable(doc, name, "SALES REPORT", `Period: ${from} to ${to}`)
    dataTable(
      doc,
      [
        { label: "Date", align: "left" },
        { label: "Product", align: "left" },
        { label: "Customer", align: "left" },
        { label: "Qty", align: "right" },
        { label: "Amount", align: "right" },
        { label: "Profit", align: "right" },
      ],
      rows.map((s) => [
        (s.sale_date || "").slice(0, 10),
        s.title,
        s.customer,
        s.qty,
        fmt(s.total_amount, ""),
        fmt(s.profit, ""),
      ]),
      ["", "", "", "", fmt(totalAmount, currency), fmt(totalProfit, currency)]
    )
    doc.moveDown(0.8)
    doc.fontSize(10).font("Helvetica")
    doc.text(`Total Sales: ${rows.length}`)
    doc.text(`Total Revenue: ${fmt(totalAmount, currency)}`)
    doc.text(`Total Profit: ${fmt(totalProfit, currency)}`)
    if (totalAmount > 0) doc.text(`Profit Margin: ${((totalProfit / totalAmount) * 100).toFixed(1)}%`)
    footerLine(doc, name)
  })

  return new NextResponse(Buffer.from(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="sales_report.pdf"`,
    },
  })
}