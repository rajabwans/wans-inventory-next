"use client"

import { useEffect, useState } from "react"
import DashboardShell from "@/components/DashboardShell"

interface Row {
  customer: string
  balance: number
  buckets: {
    zero: number
    thirty: number
    sixty: number
    ninety: number
  }
}

export default function DebtorsPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/reports/debtors")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => { setRows(d.rows); setTotal(d.total) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Loading report...</div></DashboardShell>
  if (error) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-red-500">{error}</div></DashboardShell>

  return (
    <DashboardShell businessName="" role="">
      <h1 className="text-2xl font-bold mb-6">Debtors Report</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Outstanding</div>
        <div className="text-2xl font-bold text-red-600">UGX {total.toLocaleString()}</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4 text-right">Balance</th>
              <th className="py-3 px-4 text-right">0-30 days</th>
              <th className="py-3 px-4 text-right">31-60 days</th>
              <th className="py-3 px-4 text-right">61-90 days</th>
              <th className="py-3 px-4 text-right">90+ days</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">No outstanding debts.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.customer} className="border-b border-gray-50 last:border-0">
                <td className="py-2.5 px-4 font-medium">{r.customer}</td>
                <td className="py-2.5 px-4 text-right font-bold text-red-600">UGX {r.balance.toLocaleString()}</td>
                <td className="py-2.5 px-4 text-right text-gray-600">{r.buckets.zero > 0 ? `UGX ${r.buckets.zero.toLocaleString()}` : "-"}</td>
                <td className="py-2.5 px-4 text-right text-amber-600">{r.buckets.thirty > 0 ? `UGX ${r.buckets.thirty.toLocaleString()}` : "-"}</td>
                <td className="py-2.5 px-4 text-right text-orange-600">{r.buckets.sixty > 0 ? `UGX ${r.buckets.sixty.toLocaleString()}` : "-"}</td>
                <td className="py-2.5 px-4 text-right text-red-700">{r.buckets.ninety > 0 ? `UGX ${r.buckets.ninety.toLocaleString()}` : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  )
}
