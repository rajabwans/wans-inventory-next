"use client"

import { useEffect, useState } from "react"
import DashboardShell from "@/components/DashboardShell"

interface Row {
  title: string
  category: string
  quantity: number
  buying_price: number
  selling_price: number
  stock_value: number
  potential_revenue: number
  potential_profit: number
}

interface Totals {
  quantity: number
  stock_value: number
  potential_revenue: number
  potential_profit: number
}

export default function StockReportPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [totals, setTotals] = useState<Totals | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/wans/api/reports/stock")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => { setRows(d.rows); setTotals(d.totals) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Loading report...</div></DashboardShell>
  if (error) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-red-500">{error}</div></DashboardShell>

  return (
    <DashboardShell businessName="" role="">
      <h1 className="text-2xl font-bold mb-6">Stock Report</h1>

      {totals && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Items</div>
            <div className="text-xl font-bold">{totals.quantity.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Stock Value</div>
            <div className="text-xl font-bold">UGX {totals.stock_value.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Potential Revenue</div>
            <div className="text-xl font-bold text-green-600">UGX {totals.potential_revenue.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Potential Profit</div>
            <div className="text-xl font-bold text-indigo-600">UGX {totals.potential_profit.toLocaleString()}</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-right">Qty</th>
              <th className="py-3 px-4 text-right">Buy Price</th>
              <th className="py-3 px-4 text-right">Sell Price</th>
              <th className="py-3 px-4 text-right">Stock Value</th>
              <th className="py-3 px-4 text-right">Revenue</th>
              <th className="py-3 px-4 text-right">Profit</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={8} className="py-12 text-center text-gray-400">No products found.</td></tr>
            )}
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0">
                <td className="py-2.5 px-4 font-medium">{r.title}</td>
                <td className="py-2.5 px-4 text-gray-600">{r.category || "-"}</td>
                <td className="py-2.5 px-4 text-right">{r.quantity}</td>
                <td className="py-2.5 px-4 text-right">{r.buying_price.toLocaleString()}</td>
                <td className="py-2.5 px-4 text-right">{r.selling_price.toLocaleString()}</td>
                <td className="py-2.5 px-4 text-right">{r.stock_value.toLocaleString()}</td>
                <td className="py-2.5 px-4 text-right">{r.potential_revenue.toLocaleString()}</td>
                <td className="py-2.5 px-4 text-right text-green-600">{r.potential_profit.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  )
}
