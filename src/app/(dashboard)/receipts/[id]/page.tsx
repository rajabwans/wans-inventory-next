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

export default function ReceiptPage() {
  const params = useParams()
  const id = params.id
  const [sale, setSale] = useState<SaleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/wans/api/sales/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => setSale(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Loading receipt...</div></DashboardShell>
  if (error) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-red-500">{error}</div></DashboardShell>
  if (!sale) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Receipt not found</div></DashboardShell>

  const remaining = (Number(sale.total_amount) || 0) - (Number(sale.amount_paid) || 0)

  const printReceipt = () => window.print()

  const shareText = `Receipt #${sale.id}\nProduct: ${sale.product_title}\nQty: ${sale.quantity_sold}\nTotal: ${Number(sale.total_amount).toLocaleString()}\nPaid: ${Number(sale.amount_paid).toLocaleString()}\nStatus: ${sale.payment_status}\nDate: ${sale.sale_date ? new Date(sale.sale_date).toLocaleDateString() : "-"}`

  const waLink = `https://wa.me/?text=${encodeURIComponent(shareText)}`

  return (
    <DashboardShell businessName="" role="">
      <div className="flex items-center gap-3 mb-6 no-print">
        <Link href="/sales" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <h1 className="text-2xl font-bold">Receipt</h1>
        <div className="ml-auto flex gap-2 no-print">
          <a href={`/wans/api/receipts/${sale.id}/pdf`} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Download PDF</a>
          <button onClick={printReceipt} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Print</button>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">WhatsApp</a>
        </div>
      </div>

      <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8 print:shadow-none print:border-none print:p-4">
        <div className="text-center mb-6">
          <div className="text-lg font-bold">Receipt</div>
          <div className="text-sm text-gray-500">#{sale.id}</div>
          <div className="text-xs text-gray-400 mt-1">{sale.sale_date ? new Date(sale.sale_date).toLocaleDateString() : "-"}</div>
        </div>

        <div className="space-y-3 text-sm border-t border-b border-gray-100 py-4 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Product</span>
            <span className="font-medium">{sale.product_title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Customer</span>
            <span>{sale.customer_display}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Quantity</span>
            <span>{sale.quantity_sold}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Unit Price</span>
            <span>{Number(sale.unit_price).toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold text-base">
            <span>Total</span>
            <span>{Number(sale.total_amount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Paid</span>
            <span>{Number(sale.amount_paid).toLocaleString()}</span>
          </div>
          {remaining > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Remaining</span>
              <span className="font-semibold">{remaining.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <span className={`font-medium capitalize ${sale.payment_status === "paid" ? "text-green-600" : sale.payment_status === "partial" ? "text-amber-600" : "text-red-600"}`}>{sale.payment_status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Payment Method</span>
            <span className="capitalize">{sale.payment_method}</span>
          </div>
        </div>

        <div className="text-center text-xs text-gray-400">
          Thank you for your purchase
        </div>
      </div>
    </DashboardShell>
  )
}
