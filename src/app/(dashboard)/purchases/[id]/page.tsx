"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import DashboardShell from "@/components/DashboardShell"
import Link from "next/link"

interface PurchaseDetail {
  id: number
  supplier_name: string
  supplier_phone: string | null
  supplier_email: string | null
  purchase_date: string
  total_amount: number
  note: string | null
  created_by: string
  created_at: string
  items: Array<{
    id: number
    product_title: string
    quantity: number
    unit_cost: number
    line_total: number
    expiry_date: string | null
  }>
}

export default function PurchaseDetailPage() {
  const params = useParams()
  const id = params.id
  const [purchase, setPurchase] = useState<PurchaseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/wans/api/purchases/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => {
        if (d?.error) throw new Error(d.error)
        setPurchase(d)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Loading...</div></DashboardShell>
  if (error) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-red-500">{error}</div></DashboardShell>
  if (!purchase) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Purchase not found</div></DashboardShell>

  return (
    <DashboardShell businessName="" role="">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/purchases" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <h1 className="text-2xl font-bold">Purchase #{purchase.id}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">Purchase Info</h2>
          <div className="space-y-2 text-sm">
            <div><span className="text-gray-400">Date:</span> {purchase.purchase_date ? new Date(purchase.purchase_date).toLocaleDateString() : "-"}</div>
            <div><span className="text-gray-400">Created By:</span> {purchase.created_by}</div>
            {purchase.note && <div><span className="text-gray-400">Note:</span> {purchase.note}</div>}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">Supplier</h2>
          <div className="space-y-2 text-sm">
            <div className="font-medium">{purchase.supplier_name}</div>
            <div><span className="text-gray-400">Phone:</span> {purchase.supplier_phone || "-"}</div>
            <div><span className="text-gray-400">Email:</span> {purchase.supplier_email || "-"}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">Total</h2>
          <div className="text-2xl font-bold">{Number(purchase.total_amount).toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold">Items</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4 text-right">Quantity</th>
              <th className="py-3 px-4 text-right">Unit Cost</th>
              <th className="py-3 px-4 text-right">Line Total</th>
              <th className="py-3 px-4">Expiry</th>
            </tr>
          </thead>
          <tbody>
            {purchase.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 last:border-0">
                <td className="py-2.5 px-4 font-medium">{item.product_title}</td>
                <td className="py-2.5 px-4 text-right">{item.quantity}</td>
                <td className="py-2.5 px-4 text-right">{Number(item.unit_cost).toLocaleString()}</td>
                <td className="py-2.5 px-4 text-right">{Number(item.line_total).toLocaleString()}</td>
                <td className="py-2.5 px-4 text-gray-600">{item.expiry_date || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  )
}
