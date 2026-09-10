"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardShell from "@/components/DashboardShell"
import Link from "next/link"

interface Supplier {
  id: number
  name: string
}

interface Product {
  id: number
  title: string
}

interface LineItem {
  product_id: string
  quantity: string
  unit_cost: string
  expiry_date: string
}

export default function AddPurchasePage() {
  const router = useRouter()

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [supplierId, setSupplierId] = useState("")
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0])
  const [note, setNote] = useState("")
  const [items, setItems] = useState<LineItem[]>([
    { product_id: "", quantity: "", unit_cost: "", expiry_date: "" },
  ])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([
      fetch("/api/suppliers").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ]).then(([sups, prods]) => {
      setSuppliers(sups || [])
      setProducts(prods || [])
    }).catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function updateItem(index: number, field: keyof LineItem, value: string) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  function addItem() {
    setItems((prev) => [...prev, { product_id: "", quantity: "", unit_cost: "", expiry_date: "" }])
  }

  function removeItem(index: number) {
    if (items.length <= 1) return
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const runningTotal = items.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0) * (Number(item.unit_cost) || 0)
  }, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")

    const validItems = items.filter((item) => item.product_id && Number(item.quantity) > 0)
    if (validItems.length === 0) {
      setError("Add at least one item with a product and quantity")
      setSaving(false)
      return
    }

    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier_id: supplierId || null,
          purchase_date: purchaseDate,
          note: note || null,
          items: validItems.map((item) => ({
            product_id: Number(item.product_id),
            quantity: Number(item.quantity),
            unit_cost: Number(item.unit_cost) || 0,
            expiry_date: item.expiry_date || undefined,
          })),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create purchase")
      }
      router.push("/purchases")
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
          <Link href="/purchases" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-2xl font-bold">New Purchase</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</div>}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="">No supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                <input type="date" required value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-500">Line Items</h2>
              <button type="button" onClick={addItem} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">+ Add Line</button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-12 sm:col-span-4">
                    <label className="block text-xs text-gray-400 mb-1">Product</label>
                    <select required value={item.product_id} onChange={(e) => updateItem(index, "product_id", e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm">
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <label className="block text-xs text-gray-400 mb-1">Qty</label>
                    <input type="number" required min="1" value={item.quantity} onChange={(e) => updateItem(index, "quantity", e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <label className="block text-xs text-gray-400 mb-1">Unit Cost</label>
                    <input type="number" step="any" required min="0" value={item.unit_cost} onChange={(e) => updateItem(index, "unit_cost", e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <label className="block text-xs text-gray-400 mb-1">Expiry</label>
                    <input type="date" value={item.expiry_date} onChange={(e) => updateItem(index, "expiry_date", e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button type="button" onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600 text-lg" disabled={items.length <= 1}>&times;</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
              <div className="text-sm">
                <span className="text-gray-500">Total: </span>
                <span className="font-bold text-lg">{runningTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {saving ? "Saving..." : "Create Purchase"}
            </button>
            <Link href="/purchases" className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</Link>
          </div>
        </form>
      </div>
    </DashboardShell>
  )
}
