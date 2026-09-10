import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const bid = session.business_id
  const body = await req.json().catch(() => null)
  if (!body?.ops || !Array.isArray(body.ops)) {
    return NextResponse.json({ error: "ops array is required" }, { status: 400 })
  }

  const results: { index: number; status: string; real_id?: number; message?: string }[] = []

  for (let i = 0; i < body.ops.length; i++) {
    const op = body.ops[i]
    try {
      if (op.type === "product") {
        const { data, error } = await supabase
          .from("products")
          .insert({
            business_id: bid,
            title: op.title,
            category: op.category || null,
            quantity: Number(op.quantity) || 0,
            buying_price: Number(op.buying_price) || 0,
            selling_price: Number(op.selling_price) || 0,
            notes: op.notes || null,
            version: 1,
          })
          .select()
          .single()

        if (error) throw new Error(error.message)
        results.push({ index: i, status: "ok", real_id: data.id })
      } else if (op.type === "customer") {
        const { data, error } = await supabase
          .from("customers")
          .insert({
            business_id: bid,
            name: op.name,
            phone: op.phone || null,
            email: op.email || null,
            address: op.address || null,
          })
          .select()
          .single()

        if (error) throw new Error(error.message)
        results.push({ index: i, status: "ok", real_id: data.id })
      } else if (op.type === "expense") {
        const { data, error } = await supabase
          .from("expenses")
          .insert({
            business_id: bid,
            description: op.description,
            amount: Number(op.amount),
            category: op.category || null,
            user_id: session.user_id,
            expense_date: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) throw new Error(error.message)
        results.push({ index: i, status: "ok", real_id: data.id })
      } else if (op.type === "sale") {
        const saleItems = op.items || []
        let totalAmount = 0
        let totalProfit = 0
        const resolvedItems: { product_id: number; qty: number; unit_price: number; buying_price: number }[] = []

        for (const item of saleItems) {
          const { data: product, error: prodErr } = await supabase
            .from("products")
            .select("*")
            .eq("id", Number(item.product_id))
            .eq("business_id", bid)
            .single()

          if (prodErr || !product) throw new Error(`Product ${item.product_id} not found`)
          if (product.quantity < Number(item.qty)) throw new Error(`Insufficient stock for ${product.title}`)

          const unitPrice = Number(item.unit_price) || product.selling_price
          const qty = Number(item.qty)
          totalAmount += unitPrice * qty
          totalProfit += (unitPrice - product.buying_price) * qty
          resolvedItems.push({ product_id: product.id, qty, unit_price: unitPrice, buying_price: product.buying_price })
        }

        const amountPaid = Number(op.amount_paid) || 0
        const paymentMethod = op.payment_method || "cash"
        const paymentStatus = paymentMethod === "credit" ? "unpaid" : amountPaid >= totalAmount ? "paid" : amountPaid > 0 ? "partial" : "unpaid"

        const { data: sale, error: saleErr } = await supabase
          .from("sales")
          .insert({
            business_id: bid,
            product_id: saleItems[0]?.product_id ? Number(saleItems[0].product_id) : null,
            customer_id: op.customer_id ? Number(op.customer_id) : null,
            customer_name: op.customer_name || null,
            quantity_sold: resolvedItems.reduce((s, r) => s + r.qty, 0),
            unit_price: resolvedItems[0]?.unit_price || 0,
            total_amount: totalAmount,
            profit: totalProfit,
            payment_status: paymentStatus,
            amount_paid: amountPaid,
            payment_method: paymentMethod,
            sale_date: new Date().toISOString(),
          })
          .select()
          .single()

        if (saleErr) throw new Error(saleErr.message)

        if (amountPaid > 0) {
          await supabase.from("sale_payments").insert({
            business_id: bid,
            sale_id: sale.id,
            amount: amountPaid,
            method: paymentMethod,
            note: null,
            recorded_by: session.username,
          })
        }

        for (const ri of resolvedItems) {
          const { data: batches } = await supabase
            .from("product_batches")
            .select("*")
            .eq("business_id", bid)
            .eq("product_id", ri.product_id)
            .gt("quantity", 0)
            .order("expiry_date", { ascending: true })
            .order("created_at", { ascending: true })

          let remaining = ri.qty
          for (const batch of batches || []) {
            if (remaining <= 0) break
            const take = Math.min(batch.quantity, remaining)
            remaining -= take
            await supabase
              .from("product_batches")
              .update({ quantity: batch.quantity - take })
              .eq("id", batch.id)
          }

          const { data: prod } = await supabase
            .from("products")
            .select("quantity")
            .eq("id", ri.product_id)
            .single()

          if (prod) {
            await supabase
              .from("products")
              .update({ quantity: prod.quantity - ri.qty, updated_at: new Date().toISOString() })
              .eq("id", ri.product_id)
          }
        }

        results.push({ index: i, status: "ok", real_id: sale.id })
      } else {
        results.push({ index: i, status: "error", message: `Unknown op type: ${op.type}` })
      }
    } catch (err: any) {
      results.push({ index: i, status: "error", message: err.message || "Unknown error" })
    }
  }

  return NextResponse.json({ results })
}
