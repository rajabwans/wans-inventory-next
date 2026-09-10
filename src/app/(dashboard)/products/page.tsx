"use client"

import { useEffect, useState } from "react"
import DashboardShell from "@/components/DashboardShell"
import Link from "next/link"

interface Product {
  id: number
  title: string
  category: string | null
  quantity: number
  buying_price: number
  selling_price: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [adjustingId, setAdjustingId] = useState<number | null>(null)
  const [adjustType, setAdjustType] = useState("")
  const [adjustQty, setAdjustQty] = useState("")
  const [adjustReason, setAdjustReason] = useState("")
  const [adjustError, setAdjustError] = useState("")

  function fetchProducts(q?: string) {
    const url = q ? `/api/products?search=${encodeURIComponent(q)}` : "/api/products"
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => setProducts(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    fetchProducts(search)
  }

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
    if (res.ok) setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  async function handleAdjust(productId: number) {
    if (!adjustType || !adjustQty) {
      setAdjustError("Type and quantity are required")
      return
    }
    setAdjustError("")
    const res = await fetch(`/api/products/${productId}/adjust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adjustment_type: adjustType,
        quantity: Number(adjustQty),
        reason: adjustReason || null,
      }),
    })
    if (!res.ok) {
      const data = await res.json()
      setAdjustError(data.error || "Failed")
      return
    }
    setAdjustingId(null)
    setAdjustType("")
    setAdjustQty("")
    setAdjustReason("")
    fetchProducts(search)
  }

  function stockClass(qty: number) {
    if (qty <= 0) return "text-red-600 font-bold"
    if (qty <= 5) return "text-amber-600 font-semibold"
    return ""
  }

  if (loading) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Loading products...</div></DashboardShell>
  if (error) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-red-500">{error}</div></DashboardShell>

  return (
    <DashboardShell businessName="" role="">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/products/add" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Product
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <button type="submit" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Search</button>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-right">Qty</th>
              <th className="py-3 px-4 text-right">Buy Price</th>
              <th className="py-3 px-4 text-right">Sell Price</th>
              <th className="py-3 px-4 text-right">Margin</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr><td colSpan={7} className="py-12 text-center text-gray-400">No products found.</td></tr>
            )}
            {products.map((p) => {
              const margin = p.selling_price - p.buying_price
              return (
                <tr key={p.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2.5 px-4 font-medium">{p.title}</td>
                  <td className="py-2.5 px-4 text-gray-600">{p.category || "-"}</td>
                  <td className={`py-2.5 px-4 text-right ${stockClass(p.quantity)}`}>{p.quantity}</td>
                  <td className="py-2.5 px-4 text-right">{Number(p.buying_price).toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-right">{Number(p.selling_price).toLocaleString()}</td>
                  <td className={`py-2.5 px-4 text-right ${margin < 0 ? "text-red-500" : "text-green-600"}`}>{Number(margin).toLocaleString()}</td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/products/add?id=${p.id}`} className="text-indigo-600 hover:underline text-xs">Edit</Link>
                      <div className="relative">
                        <button
                          onClick={() => setAdjustingId(adjustingId === p.id ? null : p.id)}
                          className="text-amber-600 hover:underline text-xs"
                        >Adjust</button>
                        {adjustingId === p.id && (
                          <div className="absolute z-10 top-7 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-64">
                            <select value={adjustType} onChange={(e) => setAdjustType(e.target.value)} className="w-full mb-2 px-2 py-1.5 border border-gray-200 rounded text-xs">
                              <option value="">Select type</option>
                              <option value="restock">Restock (+)</option>
                              <option value="returned">Returned (+)</option>
                              <option value="damaged">Damaged (-)</option>
                              <option value="stolen">Stolen (-)</option>
                              <option value="correction">Correction (set)</option>
                            </select>
                            <input
                              type="number"
                              placeholder="Quantity"
                              value={adjustQty}
                              onChange={(e) => setAdjustQty(e.target.value)}
                              className="w-full mb-2 px-2 py-1.5 border border-gray-200 rounded text-xs"
                            />
                            <input
                              placeholder="Reason (optional)"
                              value={adjustReason}
                              onChange={(e) => setAdjustReason(e.target.value)}
                              className="w-full mb-2 px-2 py-1.5 border border-gray-200 rounded text-xs"
                            />
                            {adjustError && <div className="text-red-500 text-xs mb-1">{adjustError}</div>}
                            <div className="flex gap-1">
                              <button onClick={() => handleAdjust(p.id)} className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700">Apply</button>
                              <button onClick={() => { setAdjustingId(null); setAdjustError("") }} className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200">Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>
                      <button onClick={() => handleDelete(p.id, p.title)} className="text-red-500 hover:underline text-xs">Delete</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  )
}
