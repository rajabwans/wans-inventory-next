import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { supabase } from "@/lib/supabase"
import { generatePDF, headerTable, infoRows, footerLine, fmt } from "@/lib/pdf"

export const dynamic = "force-dynamic"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const bid = session.business_id
  const { id } = await params

  const { data: sale, error } = await supabase
    .from("sales")
    .select("*, products(title), customers(name)")
    .eq("id", Number(id))
    .eq("business_id", bid)
    .single()

  if (error || !sale) return NextResponse.json({ error: "Sale not found" }, { status: 404 })

  const { data: business } = await supabase
    .from("businesses")
    .select("name, currency")
    .eq("id", bid)
    .single()

  const name = business?.name || "WANPLAN"
  const currency = business?.currency || "UGX"
  const dateStr = String(sale.sale_date || "").slice(0, 10)
  const remaining = (sale.total_amount || 0) - (sale.amount_paid || 0)

  const buf = await generatePDF((doc) => {
    headerTable(doc, name, `RECEIPT #${sale.id}`, dateStr)
    infoRows(doc, [
      ["Customer", sale.customers?.name || sale.customer_name || "Walk-in"],
      ["Product", (sale as any).products?.title || ""],
      ["Qty", `${sale.quantity_sold}`],
      ["Unit Price", fmt(sale.unit_price, currency)],
      ["Total", fmt(sale.total_amount, currency)],
      ["Paid", fmt(sale.amount_paid || 0, currency)],
      ...(remaining > 0 ? [["Remaining", fmt(remaining, currency)] as [string, string]] : []),
      ["Status", (sale.payment_status || "").toUpperCase()],
      ["Method", (sale.payment_method || "").toUpperCase()],
    ])
    doc.moveDown(0.8)
    doc.save()
      .fillColor("#d4edda")
      .rect(40, doc.y, 515, 34)
      .fill()
      .restore()
    doc
      .fillColor("#111827")
      .font("Helvetica-Bold")
      .fontSize(16)
      .text(`TOTAL PAID: ${fmt(sale.total_amount, currency)}`, 52, doc.y + 8, { width: 490, align: "center" })
    footerLine(doc, name)
  })

  return new NextResponse(Buffer.from(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="receipt_${sale.id}.pdf"`,
    },
  })
}