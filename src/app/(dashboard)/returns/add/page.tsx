"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
  amount_paid: number
  payment_status: string
  sale_date: string
}

interface ReturnItem {
  product_id: number
  product_title: string
  quantity_sold: number
  quantity_returned: string
  refund_amount: string
  reason: string
}

export default function AddReturnPage() {
  const router = useRouter()

  const [sales, setSales] = useState<Sale[]>([])
  const [selectedSaleId, setSelectedSaleId] = useState("")
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/sales")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => setSales(d || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filteredSales = sales.filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.product_title.toLowerCase().includes(q) || s.customer_display.toLowerCase().includes(q) || String(s.id).includes(q)
  })

  function handleSelectSale(saleId: string) {
    setSelectedSaleId(saleId)
    setError("")
    if (!saleId) {
      setReturnItems([])
      return
    }
    const sale = sales.find((s) => s.id === Number(saleId))
    if (sale) {
      setReturnItems([{
        product_id: sale.product_id,
        product_title: sale.product_title,
        quantity_sold: sale.quantity_sold,
        quantity_returned: "",
        refund_amount: "",
        reason: "",
      }])
    }
  }

  function updateReturnItem(index: number, field: keyof ReturnItem, value: string) {
    setReturnItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")

    if (!selectedSaleId) {
      setError("Select a sale")
      setSaving(false)
      return
    }

    const validItems = returnItems.filter((item) => Number(item.quantity_returned) > 0)
    if (validItems.length === 0) {
      setError("Enter return quantity for at least one item")
      setSaving(false)
      return
    }

    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sale_id: Number(selectedSaleId),
          items: validItems.map((item) => ({
            product_id: item.product_id,
            quantity_returned: Number(item.quantity_returned),
            refund_amount: Number(item.refund_amount) || 0,
            reason: item.reason || null,
          })),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to process return")
      }
      router.push("/returns")
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Loading...</div></DashboardShell>

  return (
    <DashboardShell businessName="" role="">
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/returns" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-2xl font-bold">New Return</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</div>}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Sale *</label>
              <input
                type="text"
                placeholder="Search by product, customer, or sale ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-2"
              />
              <select
                required
                value={selectedSaleId}
                onChange={(e) => handleSelectSale(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a sale</option>
                {filteredSales.map((s) => (
                  <option key={s.id} value={s.id}>
                    #{s.id} - {s.product_title} x{s.quantity_sold} ({s.customer_display}) - {s.sale_date ? new Date(s.sale_date).toLocaleDateString() : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {returnItems.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-500 mb-4">Return Items</h2>
              <div className="space-y-4">
                {returnItems.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{item.product_title}</span>
                      <span className="text-xs text-gray-400">Sold: {item.quantity_sold}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Qty Returning</label>
                        <input
                          type="number"
                          required
                          min="1"
                          max={item.quantity_sold}
                          value={item.quantity_returned}
                          onChange={(e) => updateReturnItem(index, "quantity_returned", e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Refund Amount</label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={item.refund_amount}
                          onChange={(e) => updateReturnItem(index, "refund_amount", e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Reason</label>
                        <input
                          type="text"
                          value={item.reason}
                          onChange={(e) => updateReturnItem(index, "reason", e.target.value)}
                          placeholder="Optional"
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {saving ? "Processing..." : "Process Return"}
            </button>
            <Link href="/returns" className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</Link>
          </div>
        </form>
      </div>
    </DashboardShell>
  )
}
