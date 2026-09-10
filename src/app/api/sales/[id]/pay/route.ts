import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const bid = session.business_id
  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body?.amount || !body?.method) {
    return NextResponse.json({ error: "amount and method are required" }, { status: 400 })
  }

  const { data: sale } = await supabase
    .from("sales")
    .select("*")
    .eq("id", Number(id))
    .eq("business_id", bid)
    .single()

  if (!sale) return NextResponse.json({ error: "Sale not found" }, { status: 404 })

  const paymentAmount = Number(body.amount)
  const newAmountPaid = (sale.amount_paid || 0) + paymentAmount
  const totalAmount = sale.total_amount || 0
  const newStatus = newAmountPaid >= totalAmount ? "paid" : newAmountPaid > 0 ? "partial" : "unpaid"

  await supabase.from("sale_payments").insert({
    business_id: bid,
    sale_id: sale.id,
    amount: paymentAmount,
    method: body.method,
    note: body.note || null,
    recorded_by: session.username,
  })

  const { error } = await supabase
    .from("sales")
    .update({ amount_paid: newAmountPaid, payment_status: newStatus })
    .eq("id", sale.id)
    .eq("business_id", bid)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from("audit_log").insert({
    business_id: bid,
    user_id: session.user_id,
    username: session.username,
    action: "payment",
    table_name: "sales",
    record_id: sale.id,
    details: `Recorded ${body.method} payment of ${paymentAmount} for sale #${sale.id}`,
  })

  return NextResponse.json({ ok: true, amount_paid: newAmountPaid, payment_status: newStatus })
}
