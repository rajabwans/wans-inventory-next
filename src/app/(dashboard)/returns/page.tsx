"use client"

import { useEffect, useState } from "react"
import DashboardShell from "@/components/DashboardShell"
import Link from "next/link"

interface Return {
  id: number
  sale_id: number
  product_title: string
  quantity_sold: number
  quantity_returned: number
  refund_amount: number
  reason: string | null
  created_by: string
  created_at: string
}

export default function ReturnsPage() {
  const [returns, setReturns] = useState<Return[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/returns")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => setReturns(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const totalRefunded = returns.reduce((sum, r) => sum + (Number(r.refund_amount) || 0), 0)

  if (loading) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Loading returns...</div></DashboardShell>
  if (error) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-red-500">{error}</div></DashboardShell>

  return (
    <DashboardShell businessName="" role="">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Returns</h1>
        <Link href="/returns/add" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Return
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Total Returns</div>
          <div className="text-xl font-bold">{returns.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Total Refunded</div>
          <div className="text-xl font-bold text-red-600">{totalRefunded.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Sale</th>
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4 text-right">Qty Sold</th>
              <th className="py-3 px-4 text-right">Returned</th>
              <th className="py-3 px-4 text-right">Refund</th>
              <th className="py-3 px-4">Reason</th>
              <th className="py-3 px-4">By</th>
            </tr>
          </thead>
          <tbody>
            {returns.length === 0 && (
              <tr><td colSpan={8} className="py-12 text-center text-gray-400">No returns yet.</td></tr>
            )}
            {returns.map((r) => (
              <tr key={r.id} className="border-b border-gray-50 last:border-0">
                <td className="py-2.5 px-4">{r.created_at ? new Date(r.created_at).toLocaleDateString() : "-"}</td>
                <td className="py-2.5 px-4">#{r.sale_id}</td>
                <td className="py-2.5 px-4 font-medium">{r.product_title}</td>
                <td className="py-2.5 px-4 text-right">{r.quantity_sold}</td>
                <td className="py-2.5 px-4 text-right">{r.quantity_returned}</td>
                <td className="py-2.5 px-4 text-right">{Number(r.refund_amount).toLocaleString()}</td>
                <td className="py-2.5 px-4 text-gray-600">{r.reason || "-"}</td>
                <td className="py-2.5 px-4 text-gray-600">{r.created_by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  )
}
