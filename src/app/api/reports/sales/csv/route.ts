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

  const { data, error } = await supabase
    .from("sales")
    .select("*, products(title), customers(name)")
    .eq("business_id", bid)
    .gte("sale_date", from + "T00:00:00")
    .lte("sale_date", to + "T23:59:59")
    .order("sale_date", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = (data || []).map((s: any) => [
    (s.sale_date || "").slice(0, 10),
    s.products?.title || "",
    s.customers?.name || s.customer_name || "Walk-in",
    s.quantity_sold,
    s.unit_price,
    s.total_amount,
    s.profit,
    s.payment_status || "",
    s.payment_method || "",
  ])

  const body = csv(
    ["Date", "Product", "Customer", "Qty", "Unit Price", "Total", "Profit", "Payment Status", "Method"],
    rows
  )

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sales_report.csv"`,
    },
  })
}