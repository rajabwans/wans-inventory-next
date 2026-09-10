"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import DashboardShell from "@/components/DashboardShell"
import Link from "next/link"

interface Category {
  id: number
  name: string
}

export default function Page() {
  return <Suspense fallback={null}><AddProductPage /></Suspense>
}

function AddProductPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("id")

  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [quantity, setQuantity] = useState("0")
  const [buyingPrice, setBuyingPrice] = useState("0")
  const [sellingPrice, setSellingPrice] = useState("0")
  const [expiryDate, setExpiryDate] = useState("")
  const [notes, setNotes] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([
      fetch("/api/categories?kind=product").then((r) => r.json()),
      editId ? fetch(`/api/products/${editId}`).then((r) => r.json()) : Promise.resolve(null),
    ]).then(([cats, product]) => {
      setCategories(cats || [])
      if (product && !product.error) {
        setTitle(product.title || "")
        setCategory(product.category || "")
        setQuantity(String(product.quantity ?? 0))
        setBuyingPrice(String(product.buying_price ?? 0))
        setSellingPrice(String(product.selling_price ?? 0))
        setExpiryDate(product.expiry_date || "")
        setNotes(product.notes || "")
      }
    }).catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [editId])

  const margin = (Number(sellingPrice) || 0) - (Number(buyingPrice) || 0)
  const marginPercent = Number(buyingPrice) > 0 ? ((margin / Number(buyingPrice)) * 100).toFixed(1) : "0.0"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")

    const payload = {
      title,
      category: category || null,
      quantity: Number(quantity),
      buying_price: Number(buyingPrice),
      selling_price: Number(sellingPrice),
      expiry_date: expiryDate || null,
      notes: notes || null,
    }

    try {
      const url = editId ? `/api/products/${editId}` : "/api/products"
      const method = editId ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to save")
      }
      router.push("/products")
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Loading...</div></DashboardShell>

  return (
    <DashboardShell businessName="" role="">
      <div className="max-w-xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/products" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-2xl font-bold">{editId ? "Edit Product" : "Add Product"}</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buying Price</label>
              <input type="number" step="any" value={buyingPrice} onChange={(e) => setBuyingPrice(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
              <input type="number" step="any" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-gray-500">Margin Preview</span>
            <span className={`font-semibold ${margin < 0 ? "text-red-500" : "text-green-600"}`}>
              {Number(margin).toLocaleString()} ({marginPercent}%)
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {saving ? "Saving..." : editId ? "Update Product" : "Create Product"}
            </button>
            <Link href="/products" className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</Link>
          </div>
        </form>
      </div>
    </DashboardShell>
  )
}
