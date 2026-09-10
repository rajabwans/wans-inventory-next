"use client"

import { useEffect, useState } from "react"
import DashboardShell from "@/components/DashboardShell"

interface CategoryBreakdown {
  category: string
  amount: number
}

interface ReportData {
  from: string
  to: string
  revenue: number
  cogs: number
  gross_profit: number
  expenses_total: number
  category_breakdown: CategoryBreakdown[]
  net_profit: number
}

export default function ProfitLossPage() {
  const [data, setData] = useState<ReportData | null>(null)
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
    fetch(`/wans/api/reports/profit-loss?from=${f}&to=${t}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => setData(d))
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
      <h1 className="text-2xl font-bold mb-6">Profit & Loss</h1>

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
        <a href={`/wans/api/reports/profit-loss/pdf?from=${from}&to=${to}`} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Download PDF</a>
        <a href={`/wans/api/reports/profit-loss/csv?from=${from}&to=${to}`} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Export CSV</a>
      </form>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading report...</div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">{error}</div>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Revenue</div>
              <div className="text-xl font-bold">UGX {data.revenue.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">COGS</div>
              <div className="text-xl font-bold">UGX {data.cogs.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Gross Profit</div>
              <div className="text-xl font-bold text-green-600">UGX {data.gross_profit.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Expenses</div>
              <div className="text-xl font-bold text-red-600">UGX {data.expenses_total.toLocaleString()}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Net Profit</span>
              <span className={`text-2xl font-bold ${data.net_profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                UGX {data.net_profit.toLocaleString()}
              </span>
            </div>
          </div>

          {data.category_breakdown.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-4">Expenses by Category</h2>
              <div className="space-y-3">
                {data.category_breakdown.map((c) => (
                  <div key={c.category} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-700">{c.category}</span>
                    <span className="text-sm font-medium text-red-600">UGX {c.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </DashboardShell>
  )
}
