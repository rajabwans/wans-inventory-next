"use client"

import { useEffect, useState } from "react"
import DashboardShell from "@/components/DashboardShell"

interface Row {
  id: number
  sale_date: string
  product_title: string
  quantity_sold: number
  unit_price: number
  total_amount: number
  profit: number
  payment_status: string
  payment_method: string
}

interface Totals {
  revenue: number
  profit: number
  quantity: number
}

export default function SalesReportPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [totals, setTotals] = useState<Totals | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const now = new Date()
  const defaultFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
  const defaultTo = now.toISOString().slice(0, 10)
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(defaultTo)

  function fetchReport(f: string, t: string) {
    setLoading(true)
    setError("")
    fetch(`/wans/api/reports/sales?from=${f}&to=${t}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => { setRows(d.rows); setTotals(d.totals) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchReport(defaultFrom, defaultTo) }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    fetchReport(from, to)
  }

  return (
    <DashboardShell businessName="" role="">
      <h1 className="text-2xl font-bold mb-6">Sales Report</h1>

      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 mb-6 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Apply</button>
        <a href={`/wans/api/reports/sales/pdf?from=${from}&to=${to}`} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Download PDF</a>
        <a href={`/wans/api/reports/sales/csv?from=${from}&to=${to}`} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Export CSV</a>
      </form>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading report...</div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">{error}</div>
      ) : (
        <>
          {totals && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Revenue</div>
                <div className="text-xl font-bold">UGX {totals.revenue.toLocaleString()}</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Profit</div>
                <div className="text-xl font-bold text-green-600">UGX {totals.profit.toLocaleString()}</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Items Sold</div>
                <div className="text-xl font-bold">{totals.quantity.toLocaleString()}</div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4 text-right">Qty</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Profit</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Method</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={7} className="py-12 text-center text-gray-400">No sales found for this period.</td></tr>
                )}
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 px-4 text-gray-600">{new Date(r.sale_date).toLocaleDateString()}</td>
                    <td className="py-2.5 px-4 font-medium">{r.product_title || "-"}</td>
                    <td className="py-2.5 px-4 text-right">{r.quantity_sold}</td>
                    <td className="py-2.5 px-4 text-right">{r.total_amount.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right text-green-600">{r.profit.toLocaleString()}</td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${r.payment_status === "paid" ? "bg-green-100 text-green-700" : r.payment_status === "partial" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                        {r.payment_status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-gray-600 capitalize">{r.payment_method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DashboardShell>
  )
}
