"use client"

import { useEffect, useState } from "react"
import DashboardShell from "@/components/DashboardShell"
import Link from "next/link"

interface Sale {
  id: number
  product_id: number
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

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [payingId, setPayingId] = useState<number | null>(null)
  const [payAmount, setPayAmount] = useState("")
  const [payMethod, setPayMethod] = useState("cash")
  const [payNote, setPayNote] = useState("")
  const [payError, setPayError] = useState("")

  function fetchSales() {
    fetch("/wans/api/sales")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => setSales(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSales() }, [])

  async function handleDelete(id: number) {
    if (!confirm("Delete this sale? Stock will be restocked.")) return
    const res = await fetch(`/wans/api/sales/${id}`, { method: "DELETE" })
    if (res.ok) setSales((prev) => prev.filter((s) => s.id !== id))
  }

  async function handlePay(saleId: number) {
    if (!payAmount || Number(payAmount) <= 0) {
      setPayError("Enter a valid amount")
      return
    }
    setPayError("")
    const res = await fetch(`/wans/api/sales/${saleId}/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(payAmount), method: payMethod, note: payNote || null }),
    })
    if (!res.ok) {
      const data = await res.json()
      setPayError(data.error || "Failed")
      return
    }
    setPayingId(null)
    setPayAmount("")
    setPayNote("")
    fetchSales()
  }

  const totalRevenue = sales.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0)
  const totalProfit = sales.reduce((sum, s) => sum + (Number(s.profit) || 0), 0)
  const totalDue = sales.reduce((sum, s) => sum + ((Number(s.total_amount) || 0) - (Number(s.amount_paid) || 0)), 0)

  if (loading) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Loading sales...</div></DashboardShell>
  if (error) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-red-500">{error}</div></DashboardShell>

  return (
    <DashboardShell businessName="" role="">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Sales</h1>
        <Link href="/sales/add" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Sale
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Total Revenue</div>
          <div className="text-xl font-bold">{totalRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Total Profit</div>
          <div className="text-xl font-bold text-green-600">{totalProfit.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Total Due</div>
          <div className="text-xl font-bold text-amber-600">{totalDue.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4 text-right">Qty</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-right">Paid</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Method</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 && (
              <tr><td colSpan={9} className="py-12 text-center text-gray-400">No sales yet.</td></tr>
            )}
            {sales.map((s) => (
              <tr key={s.id} className="border-b border-gray-50 last:border-0">
                <td className="py-2.5 px-4">{s.sale_date ? new Date(s.sale_date).toLocaleDateString() : "-"}</td>
                <td className="py-2.5 px-4 font-medium">{s.product_title}</td>
                <td className="py-2.5 px-4 text-gray-600">{s.customer_display}</td>
                <td className="py-2.5 px-4 text-right">{s.quantity_sold}</td>
                <td className="py-2.5 px-4 text-right">{Number(s.total_amount).toLocaleString()}</td>
                <td className="py-2.5 px-4 text-right">{Number(s.amount_paid).toLocaleString()}</td>
                <td className="py-2.5 px-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    s.payment_status === "paid" ? "bg-green-100 text-green-700" :
                    s.payment_status === "partial" ? "bg-amber-100 text-amber-700" :
                    s.payment_status === "refunded" ? "bg-purple-100 text-purple-700" :
                    "bg-red-100 text-red-700"
                  }`}>{s.payment_status}</span>
                </td>
                <td className="py-2.5 px-4 capitalize">{s.payment_method}</td>
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/receipts/${s.id}`} className="text-indigo-600 hover:underline text-xs">Receipt</Link>
                    {(s.payment_status === "partial" || s.payment_status === "unpaid") && (
                      <div className="relative">
                        <button onClick={() => { setPayingId(payingId === s.id ? null : s.id); setPayError("") }} className="text-green-600 hover:underline text-xs">Pay</button>
                        {payingId === s.id && (
                          <div className="absolute z-10 top-7 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-64">
                            <input type="number" placeholder="Amount" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="w-full mb-2 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                            <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className="w-full mb-2 px-2 py-1.5 border border-gray-200 rounded text-xs">
                              <option value="cash">Cash</option>
                              <option value="momo">Mobile Money</option>
                              <option value="card">Card</option>
                            </select>
                            <input placeholder="Note (optional)" value={payNote} onChange={(e) => setPayNote(e.target.value)} className="w-full mb-2 px-2 py-1.5 border border-gray-200 rounded text-xs" />
                            {payError && <div className="text-red-500 text-xs mb-1">{payError}</div>}
                            <div className="flex gap-1">
                              <button onClick={() => handlePay(s.id)} className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">Submit</button>
                              <button onClick={() => setPayingId(null)} className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200">Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:underline text-xs">Delete</button>
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
