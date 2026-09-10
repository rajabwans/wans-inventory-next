"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardShell from "@/components/DashboardShell"
import Link from "next/link"

interface Category {
  id: number
  name: string
}

export default function AddExpensePage() {
  const router = useRouter()
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/wans/api/categories?kind=expense")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setCategories(d))
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const res = await fetch("/wans/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, amount: Number(amount), category: category || null }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to save")
      }
      router.push("/expenses")
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardShell businessName="" role="">
      <div className="max-w-xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/expenses" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-2xl font-bold">Add Expense</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <input type="text" required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Office rent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (UGX) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">UGX</span>
              <input type="number" required min="1" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="0" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {saving ? "Saving..." : "Add Expense"}
            </button>
            <Link href="/expenses" className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</Link>
          </div>
        </form>
      </div>
    </DashboardShell>
  )
}
