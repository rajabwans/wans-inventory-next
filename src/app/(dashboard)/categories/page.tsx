"use client"

import { useEffect, useState } from "react"
import DashboardShell from "@/components/DashboardShell"

interface Category {
  id: number
  name: string
  kind: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [newName, setNewName] = useState("")
  const [newKind, setNewKind] = useState<"product" | "expense">("product")
  const [saving, setSaving] = useState(false)
  const [addError, setAddError] = useState("")

  function fetchCategories() {
    fetch("/api/categories")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => setCategories(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCategories() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    setAddError("")

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), kind: newKind }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed")
      }
      setNewName("")
      fetchCategories()
    } catch (e: any) {
      setAddError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete category "${name}"?`)) return
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
    if (res.ok) setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  const productCats = categories.filter((c) => c.kind === "product")
  const expenseCats = categories.filter((c) => c.kind === "expense")

  if (loading) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Loading categories...</div></DashboardShell>

  function renderSection(title: string, items: Category[]) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        {items.length === 0 ? (
          <p className="text-gray-400 text-sm">No categories yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2.5">
                <span className="text-sm font-medium">{c.name}</span>
                <button onClick={() => handleDelete(c.id, c.name)} className="text-red-500 hover:underline text-xs">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  return (
    <DashboardShell businessName="" role="">
      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
      </div>

      <form onSubmit={handleAdd} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Textbooks" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kind</label>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button type="button" onClick={() => setNewKind("product")} className={`px-4 py-2 text-sm font-medium ${newKind === "product" ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>Product</button>
              <button type="button" onClick={() => setNewKind("expense")} className={`px-4 py-2 text-sm font-medium ${newKind === "expense" ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>Expense</button>
            </div>
          </div>
          <button type="submit" disabled={saving} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap">
            {saving ? "Adding..." : "Add Category"}
          </button>
        </div>
        {addError && <div className="text-red-500 text-xs mt-2">{addError}</div>}
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderSection("Product Categories", productCats)}
        {renderSection("Expense Categories", expenseCats)}
      </div>
    </DashboardShell>
  )
}
