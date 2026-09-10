"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import DashboardShell from "@/components/DashboardShell"
import Link from "next/link"

interface SaleData {
  id: number
  product_title: string
  customer_display: string
  quantity_sold: number
  unit_price: number
  total_amount: number
  profit: number
  payment_status: string
  amount_paid: number
  payment_method: string
  sale_date: string
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const id = params.id
  const [sale, setSale] = useState<SaleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/sales/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => setSale(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Loading invoice...</div></DashboardShell>
  if (error) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-red-500">{error}</div></DashboardShell>
  if (!sale) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Invoice not found</div></DashboardShell>

  const remaining = (Number(sale.total_amount) || 0) - (Number(sale.amount_paid) || 0)

  return (
    <DashboardShell businessName="" role="">
      <div className="flex items-center gap-3 mb-6 no-print">
        <Link href="/invoices" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <h1 className="text-2xl font-bold">Invoice</h1>
        <button onClick={() => window.print()} className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 no-print">Print</button>
      </div>

      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8 print:shadow-none print:border-none print:p-4">
        <div className="text-center mb-6">
          <div className="text-xl font-bold">INVOICE</div>
          <div className="text-sm text-gray-500 mt-1">Invoice #{sale.id}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-6 border-b border-gray-100 pb-4">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Bill To</div>
            <div className="font-medium">{sale.customer_display}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Date</div>
            <div>{sale.sale_date ? new Date(sale.sale_date).toLocaleDateString() : "-"}</div>
          </div>
        </div>

        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 text-xs uppercase text-gray-400">Item</th>
              <th className="text-center py-2 text-xs uppercase text-gray-400">Qty</th>
              <th className="text-right py-2 text-xs uppercase text-gray-400">Price</th>
              <th className="text-right py-2 text-xs uppercase text-gray-400">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-50">
              <td className="py-3 font-medium">{sale.product_title}</td>
              <td className="py-3 text-center">{sale.quantity_sold}</td>
              <td className="py-3 text-right">{Number(sale.unit_price).toLocaleString()}</td>
              <td className="py-3 text-right">{Number(sale.total_amount).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <div className="space-y-2 text-sm ml-auto max-w-[200px]">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>{Number(sale.total_amount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Paid</span>
            <span>{Number(sale.amount_paid).toLocaleString()}</span>
          </div>
          {remaining > 0 && (
            <div className="flex justify-between text-red-600 font-semibold">
              <span>Balance Due</span>
              <span>{remaining.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <span className={`font-medium capitalize ${sale.payment_status === "paid" ? "text-green-600" : sale.payment_status === "partial" ? "text-amber-600" : "text-red-600"}`}>{sale.payment_status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Method</span>
            <span className="capitalize">{sale.payment_method}</span>
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 mt-8 pt-4 border-t border-gray-100">
          Thank you for your business
        </div>
      </div>
    </DashboardShell>
  )
}
