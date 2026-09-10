"use client"

import { useEffect, useState } from "react"
import DashboardShell from "@/components/DashboardShell"

interface Adjustment {
  id: number
  product_id: number
  product_title: string
  adjustment_type: string
  quantity: number
  reason: string | null
  created_at: string
}

const typeColors: Record<string, string> = {
  restock: "bg-green-50 text-green-700",
  returned: "bg-blue-50 text-blue-700",
  damaged: "bg-red-50 text-red-700",
  stolen: "bg-red-50 text-red-700",
  correction: "bg-amber-50 text-amber-700",
}

export default function StockAdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/wans/api/stock/adjustments")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => setAdjustments(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Loading adjustments...</div></DashboardShell>
  if (error) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-red-500">{error}</div></DashboardShell>

  return (
    <DashboardShell businessName="" role="">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Stock Adjustments</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4 text-right">Quantity</th>
              <th className="py-3 px-4">Reason</th>
              <th className="py-3 px-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {adjustments.length === 0 && (
              <tr><td colSpan={5} className="py-12 text-center text-gray-400">No adjustments recorded yet.</td></tr>
            )}
            {adjustments.map((a) => (
              <tr key={a.id} className="border-b border-gray-50 last:border-0">
                <td className="py-2.5 px-4 font-medium">{a.product_title}</td>
                <td className="py-2.5 px-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs capitalize ${typeColors[a.adjustment_type] || "bg-gray-100 text-gray-600"}`}>
                    {a.adjustment_type}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-right">{a.quantity}</td>
                <td className="py-2.5 px-4 text-gray-600">{a.reason || "-"}</td>
                <td className="py-2.5 px-4 text-gray-500">{new Date(a.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  )
}
