import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { supabase } from "@/lib/supabase"
import { generatePDF, headerTable, infoRows, dataTable, footerLine, fmt } from "@/lib/pdf"

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
    .select("*, products(title, category), customers(name)")
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
    headerTable(doc, name, `INVOICE #${sale.id}`, dateStr)
    infoRows(doc, [
      ["Customer", sale.customers?.name || sale.customer_name || "Walk-in"],
      ["Product", (sale as any).products?.title || ""],
      ["Category", (sale as any).products?.category || "-"],
    ])
    dataTable(
      doc,
      [
        { label: "Item", align: "left" },
        { label: "Qty", align: "right" },
        { label: "Unit Price", align: "right" },
        { label: "Total", align: "right" },
      ],
      [[(sale as any).products?.title || "", sale.quantity_sold, fmt(sale.unit_price, currency), fmt(sale.total_amount, currency)]]
    )
    doc.moveDown(0.6)
    doc.fontSize(10).font("Helvetica")
    doc.fillColor("#111827").text(`Subtotal: ${fmt(sale.total_amount, currency)}`, { align: "right", width: 240 })
    doc.text(`Paid: ${fmt(sale.amount_paid || 0, currency)}`, { align: "right", width: 240 })
    if (remaining > 0) {
      doc.font("Helvetica-Bold").text(`Balance Due: ${fmt(remaining, currency)}`, { align: "right", width: 240 })
    } else {
      doc.font("Helvetica").text(`Status: ${sale.payment_status || "paid"}`, { align: "right", width: 240 })
    }
    footerLine(doc, name)
  })

  return new NextResponse(Buffer.from(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice_${sale.id}.pdf"`,
    },
  })
}