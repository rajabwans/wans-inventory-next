import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { supabase } from "@/lib/supabase"
import { getEffectivePlan } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const bid = session.business_id
  const today = new Date().toISOString().slice(0, 10)
  const in30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  const first = today.slice(0, 8) + "01"

  const [
    { data: products },
    { data: sales },
    { data: customers },
    { data: expenses },
    { data: purchases },
    { data: batches },
    { data: biz },
    { data: recentSales },
    { data: lowStock },
    { data: topProducts },
    { data: categoryBreakdown },
  ] = await Promise.all([
    supabase.from("products").select("*").eq("business_id", bid),
    supabase.from("sales").select("*").eq("business_id", bid),
    supabase.from("customers").select("*").eq("business_id", bid),
    supabase.from("expenses").select("*").eq("business_id", bid),
    supabase.from("purchases").select("id,total_amount").eq("business_id", bid),
    supabase.from("product_batches").select("id,product_id,quantity,expiry_date").eq("business_id", bid),
    supabase.from("businesses").select("*").eq("id", bid).single(),
    supabase
      .from("sales")
      .select(`
        id, sale_date, total_amount, profit, payment_status, payment_method, quantity_sold,
        product_id, customer_id, customer_name,
        products(title),
        customers(name)
      `)
      .eq("business_id", bid)
      .order("sale_date", { ascending: false })
      .limit(10),
    supabase.from("products").select("*").eq("business_id", bid).lte("quantity", 5).order("quantity").limit(10),
    supabase
      .from("sales")
      .select("id,quantity_sold,total_amount,products(title)")
      .eq("business_id", bid)
      .order("total_amount", { ascending: false })
      .limit(5),
    supabase
      .from("products")
      .select("category,id,quantity,buying_price,title")
      .eq("business_id", bid)
      .order("quantity", { ascending: false }),
  ])

  const productsList = products || []
  const salesList = sales || []
  const batchesList = batches || []
  const bizRow = biz as any

  const total_products = productsList.length
  const total_stock = productsList.reduce((a: any, p: any) => a + (Number(p.quantity) || 0), 0)
  const total_invested = productsList.reduce((a: any, p: any) => a + (Number(p.buying_price) || 0) * (Number(p.quantity) || 0), 0)
  const total_sales_amount = salesList.reduce((a: any, s: any) => a + (Number(s.total_amount) || 0), 0)
  const total_profit = salesList.reduce((a: any, s: any) => a + (Number(s.profit) || 0), 0)
  const total_possible_profit = productsList.reduce((a: any, p: any) => a + ((Number(p.selling_price) || 0) - (Number(p.buying_price) || 0)) * (Number(p.quantity) || 0), 0)
  const total_customers = (customers || []).length

  const owing = salesList.filter((s: any) => s.payment_status === "partial" || s.payment_status === "unpaid")
  const owing_total = owing.reduce((a: any, s: any) => a + ((Number(s.total_amount) || 0) - (Number(s.amount_paid) || 0)), 0)
  const debtor_count = owing.filter((s: any) => (Number(s.total_amount) || 0) - (Number(s.amount_paid) || 0) > 0.005).length

  const expiring = batchesList.filter((b: any) => b.expiry_date && b.expiry_date >= today && b.expiry_date <= in30 && Number(b.quantity) > 0)
  const expired = batchesList.filter((b: any) => b.expiry_date && b.expiry_date < today && Number(b.quantity) > 0)
  const expiring_count = expiring.reduce((a: any, b: any) => a + (Number(b.quantity) || 0), 0)
  const expired_count = expired.reduce((a: any, b: any) => a + (Number(b.quantity) || 0), 0)

  const purchase_total = (purchases || []).reduce((a: any, p: any) => a + (Number(p.total_amount) || 0), 0)

  const monthSales = salesList.filter((s: any) => {
    const d = String(s.sale_date).slice(0, 10)
    return d >= first && d < today.slice(0, 8) + "99"
  })
  const monthly_profit = monthSales.reduce((a: any, s: any) => a + (Number(s.profit) || 0), 0)
  const monthly_expenses = (expenses || [])
    .filter((e: any) => String(e.expense_date).slice(0, 10) >= first)
    .reduce((a: any, e: any) => a + (Number(e.amount) || 0), 0)

  const recentSalesList = (recentSales || []).map((s: any) => ({
    ...s,
    product_title: s.products?.title ?? "Unknown",
    customer_display: s.customers?.name ?? s.customer_name ?? "Walk-in",
  }))

  const recent_sales_count = salesList.length
  const lowStockList = lowStock || []

  const catMap = new Map<string, any>()
  for (const p of productsList) {
    const cat = p.category || "Uncategorized"
    if (!catMap.has(cat)) catMap.set(cat, { category: cat, count: 0, stock: 0, value: 0 })
    const row = catMap.get(cat)
    row.count++
    row.stock += Number(p.quantity) || 0
    row.value += (Number(p.buying_price) || 0) * (Number(p.quantity) || 0)
  }
  const categoryBreakdownList = [...catMap.values()].sort((a, b) => b.value - a.value)

  const topProductsList = (topProducts || []).map((s: any) => ({
    title: s.products?.title ?? "Unknown",
    total_sold: s.quantity_sold,
    revenue: s.total_amount,
  }))

  const plan = getEffectivePlan(bizRow)
  const total_cogs = total_sales_amount - total_profit
  const recovery = total_cogs + total_invested > 0 ? Math.round(Math.min(100, Math.max(0, (total_cogs / (total_cogs + total_invested)) * 100))) : 0

  return NextResponse.json({
    biz: bizRow,
    plan,
    stats: {
      total_products, total_stock, total_invested, total_sales_amount, total_profit,
      total_possible_profit, total_customers, owing_total, debtor_count,
      expiring_count, expired_count, purchase_total, monthly_profit, monthly_expenses,
      recent_sales_count, recovery,
    },
    recent_sales: recentSalesList,
    low_stock: lowStockList,
    top_products: topProductsList,
    category_breakdown: categoryBreakdownList,
  })
}