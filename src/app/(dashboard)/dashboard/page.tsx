"use client"

import { useEffect, useState } from "react"
import DashboardShell from "@/components/DashboardShell"
import Link from "next/link"

interface Biz {
  name: string
  currency: string
}

interface Sale {
  id: number
  sale_date: string
  total_amount: number
  profit: number
  payment_status: string
  payment_method: string
  product_title: string
  customer_display: string
}

interface Product {
  id: number
  title: string
  quantity: number
  selling_price: number
  buying_price: number
  category: string | null
}

function money(n: number | string, cur = "UGX") {
  const v = Number(n) || 0
  return `${cur} ${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/wans/api/dashboard")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => {
        setData(d)
        if (d.biz?.name) localStorage.setItem("wanplan_biz_name", d.biz.name)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Loading dashboard...</div></DashboardShell>
  if (error || !data) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-red-500">{error || "Could not load dashboard"}</div></DashboardShell>

  const s = data.stats
  const cur = data.biz?.currency || "UGX"

  const kpis = [
    { label: "Total Products", value: s.total_products.toLocaleString(), icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", grad: "from-indigo-500 to-blue-500" },
    { label: "Stock Units", value: s.total_stock.toLocaleString(), icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", grad: "from-violet-500 to-purple-500" },
    { label: "Stock Value", value: money(s.total_invested, cur), icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", grad: "from-sky-500 to-cyan-500" },
    { label: "Total Sales", value: money(s.total_sales_amount, cur), icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", grad: "from-emerald-500 to-green-500" },
    { label: "Total Profit", value: money(s.total_profit, cur), icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", grad: "from-amber-500 to-yellow-500" },
    { label: "Potential Profit", value: money(s.total_possible_profit, cur), icon: "M15 15m-2 0a2 2 0 103 0 2 2 0 10-3 0m-8 0a2 2 0 103 0 2 2 0 10-3 0m-2.5-4l-1.5-8h17.5l-1.5 8h-14.5z", grad: "from-teal-500 to-emerald-500" },
    { label: "Customers", value: s.total_customers.toLocaleString(), icon: "M17 20h5v-2a3 3 0 00-5-4.5M9 20h6M14 7a3 3 0 11-6 0 3 3 0 016 0z", grad: "from-rose-500 to-pink-500" },
    { label: "Receivables", value: money(s.owing_total, cur), icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1", grad: "from-slate-500 to-gray-500" },
    { label: "Purchases", value: money(s.purchase_total, cur), icon: "M3 3h18v18H3V3zm3-3v18M3 9h18", grad: "from-orange-500 to-amber-500" },
    { label: "Expiring (30d)", value: s.expiring_count.toLocaleString(), icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", grad: "from-yellow-500 to-orange-500" },
    { label: "Expired", value: s.expired_count.toLocaleString(), icon: "M18.364 18.364A9 9 0 005.636 5.636M21 12a9 9 0 11-18 0 9 9 0 0118 0z", grad: "from-red-500 to-rose-500" },
    { label: "Recovery Rate", value: `${s.recovery}%`, icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", grad: "from-cyan-500 to-sky-500" },
  ]

  const statusStyle: Record<string, string> = {
    paid: "bg-green-50 text-green-700",
    partial: "bg-amber-50 text-amber-700",
    unpaid: "bg-red-50 text-red-700",
    refunded: "bg-gray-100 text-gray-600",
  }

  return (
    <DashboardShell businessName={data.biz?.name || ""} role={data.biz?.plan || ""}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-0"><span className="mr-2">Executive Dashboard</span></h1>
          <p className="text-gray-500 text-sm mt-1">{data.biz?.name} — Inventory Performance Overview</p>
        </div>
        <span className="text-gray-400 text-sm" id="currentDate"></span>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-full hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[0.78rem] font-semibold uppercase tracking-wider text-gray-400">{k.label}</div>
                <div className="text-2xl font-extrabold mt-2 truncate">{k.value}</div>
              </div>
              <div className={`w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br ${k.grad} flex items-center justify-center shadow-md`}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={k.icon} />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {(Number(s.expired_count) > 0 || s.low_stock?.length > 0 || Number(s.owing_total) > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          {Number(s.expired_count) > 0 && (
            <Link href="/reports/expiring" className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 hover:bg-red-100 transition">
              <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <div className="font-semibold text-red-800">{s.expired_count} units expired</div>
                <div className="text-xs text-red-600">Check expiring stock report</div>
              </div>
            </Link>
          )}
          {Number(s.expiring_count) > 0 && (
            <Link href="/reports/expiring" className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 hover:bg-amber-100 transition">
              <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div>
                <div className="font-semibold text-amber-800">{s.expiring_count} units expiring soon</div>
                <div className="text-xs text-amber-600">Within 30 days</div>
              </div>
            </Link>
          )}
          {Number(s.owing_total) > 0 && (
            <Link href="/reports/debtors" className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3 hover:bg-purple-100 transition">
              <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <div className="font-semibold text-purple-800">{s.debtor_count} debtors owing {money(s.owing_total, cur)}</div>
                <div className="text-xs text-purple-600">View debtors report</div>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Recent sales */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Sales</h2>
          <Link href="/sales" className="text-sm text-indigo-600 hover:underline">View all &rarr;</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
                <th className="py-2 pr-4">Product</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Method</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_sales.length === 0 && (
                <tr><td colSpan={6} className="py-6 text-center text-gray-400">No sales yet. <Link href="/sales/add" className="text-indigo-600">Make your first sale</Link></td></tr>
              )}
              {data.recent_sales.map((sale: Sale) => (
                <tr key={sale.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2.5 pr-4 font-medium">{sale.product_title}</td>
                  <td className="py-2.5 pr-4 text-gray-600">{sale.customer_display}</td>
                  <td className="py-2.5 pr-4">{money(sale.total_amount, cur)}</td>
                  <td className="py-2.5 pr-4">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs capitalize ${statusStyle[sale.payment_status] || "bg-gray-100 text-gray-600"}`}>{sale.payment_status}</span>
                  </td>
                  <td className="py-2.5 pr-4 text-gray-600 capitalize">{sale.payment_method}</td>
                  <td className="py-2.5 text-gray-500">{new Date(sale.sale_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Low stock */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Low Stock</h2>
            {data.low_stock.length === 0 ? (
              <p className="text-gray-400 text-sm">All products are well stocked.</p>
            ) : (
              <ul className="space-y-3">
                {data.low_stock.map((p: Product) => (
                  <li key={p.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{p.title}</div>
                      <div className="text-xs text-gray-400">{p.category || "Uncategorized"}</div>
                    </div>
                    <div className={`font-bold ${Number(p.quantity) <= 0 ? "text-red-500" : "text-amber-500"}`}>{p.quantity} left</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Category breakdown */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Stock By Category</h2>
            {data.category_breakdown.length === 0 ? (
              <p className="text-gray-400 text-sm">No products yet.</p>
            ) : (
              <ul className="space-y-3">
                {data.category_breakdown.map((c: any) => (
                  <li key={c.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{c.category}</span>
                      <span className="font-medium">{money(c.value, cur)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${data.category_breakdown[0]?.value ? Math.max(4, (c.value / data.category_breakdown[0].value) * 100) : 0}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Top products */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Top Products</h2>
            {data.top_products.length === 0 ? (
              <p className="text-gray-400 text-sm">No sales data yet.</p>
            ) : (
              <ol className="space-y-3">
                {data.top_products.map((p: any, i: number) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{p.title}</div>
                      <div className="text-xs text-gray-400">{p.total_sold} sold</div>
                    </div>
                    <div className="font-semibold text-sm">{money(p.revenue, cur)}</div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}