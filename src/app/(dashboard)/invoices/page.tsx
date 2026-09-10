"use client"

import { useEffect, useState } from "react"
import DashboardShell from "@/components/DashboardShell"
import Link from "next/link"

interface Sale {
  id: number
  product_title: string
  customer_display: string
  quantity_sold: number
  total_amount: number
  amount_paid: number
  payment_status: string
  sale_date: string
}

export default function InvoicesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/wans/api/sales")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => setSales(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Loading invoices...</div></DashboardShell>
  if (error) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-red-500">{error}</div></DashboardShell>

  return (
    <DashboardShell businessName="" role="">
      <h1 className="text-2xl font-bold mb-6">Invoices</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 && (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">No invoices yet.</td></tr>
            )}
            {sales.map((s) => (
              <tr key={s.id} className="border-b border-gray-50 last:border-0">
                <td className="py-2.5 px-4">{s.sale_date ? new Date(s.sale_date).toLocaleDateString() : "-"}</td>
                <td className="py-2.5 px-4 font-medium">{s.product_title}</td>
                <td className="py-2.5 px-4 text-gray-600">{s.customer_display}</td>
                <td className="py-2.5 px-4 text-right">{Number(s.total_amount).toLocaleString()}</td>
                <td className="py-2.5 px-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    s.payment_status === "paid" ? "bg-green-100 text-green-700" :
                    s.payment_status === "partial" ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  }`}>{s.payment_status}</span>
                </td>
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-2">
                    <Link href={`/invoices/${s.id}`} className="text-indigo-600 hover:underline text-xs">Invoice</Link>
                    <Link href={`/receipts/${s.id}`} className="text-indigo-600 hover:underline text-xs">Receipt</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  )
}
