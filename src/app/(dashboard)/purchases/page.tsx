"use client"

import { useEffect, useState } from "react"
import DashboardShell from "@/components/DashboardShell"
import Link from "next/link"

interface Purchase {
  id: number
  supplier_id: number | null
  supplier_name: string
  purchase_date: string
  total_amount: number
  note: string | null
  created_by: string
  created_at: string
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/purchases")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => setPurchases(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const totalSpent = purchases.reduce((sum, p) => sum + (Number(p.total_amount) || 0), 0)

  if (loading) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Loading purchases...</div></DashboardShell>
  if (error) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-red-500">{error}</div></DashboardShell>

  return (
    <DashboardShell businessName="" role="">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Purchases</h1>
        <Link href="/purchases/add" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Purchase
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Total Purchases</div>
          <div className="text-xl font-bold">{purchases.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Total Spent</div>
          <div className="text-xl font-bold">{totalSpent.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Supplier</th>
              <th className="py-3 px-4">Note</th>
              <th className="py-3 px-4 text-right">Total</th>
              <th className="py-3 px-4">Created By</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 && (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">No purchases yet.</td></tr>
            )}
            {purchases.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 last:border-0">
                <td className="py-2.5 px-4">
                  <Link href={`/purchases/${p.id}`} className="text-indigo-600 hover:underline">#{p.id}</Link>
                </td>
                <td className="py-2.5 px-4">{p.purchase_date ? new Date(p.purchase_date).toLocaleDateString() : "-"}</td>
                <td className="py-2.5 px-4">{p.supplier_name}</td>
                <td className="py-2.5 px-4 text-gray-600">{p.note || "-"}</td>
                <td className="py-2.5 px-4 text-right font-medium">{Number(p.total_amount).toLocaleString()}</td>
                <td className="py-2.5 px-4 text-gray-600">{p.created_by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  )
}
