"use client"

import { useEffect, useState } from "react"
import DashboardShell from "@/components/DashboardShell"
import Link from "next/link"

interface Expense {
  id: number
  description: string
  amount: number
  category: string | null
  expense_date: string
  created_at: string
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  function fetchExpenses(q?: string) {
    const url = q ? `/api/expenses?search=${encodeURIComponent(q)}` : "/api/expenses"
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => setExpenses(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchExpenses() }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    fetchExpenses(search)
  }

  async function handleDelete(id: number, description: string) {
    if (!confirm(`Delete expense "${description}"?`)) return
    const res = await fetch(`/wans/api/expenses/${id}`, { method: "DELETE" })
    if (res.ok) setExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  if (loading) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Loading expenses...</div></DashboardShell>
  if (error) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-red-500">{error}</div></DashboardShell>

  return (
    <DashboardShell businessName="" role="">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <Link href="/expenses/add" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Expense
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex items-center gap-4">
        <span className="text-sm text-gray-500">Total:</span>
        <span className="text-lg font-bold text-red-600">UGX {total.toLocaleString()}</span>
        <span className="text-xs text-gray-400 ml-auto">{expenses.length} expense{expenses.length !== 1 ? "s" : ""}</span>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input type="text" placeholder="Search expenses..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        <button type="submit" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Search</button>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 && (
              <tr><td colSpan={5} className="py-12 text-center text-gray-400">No expenses found.</td></tr>
            )}
            {expenses.map((e) => (
              <tr key={e.id} className="border-b border-gray-50 last:border-0">
                <td className="py-2.5 px-4 font-medium">{e.description}</td>
                <td className="py-2.5 px-4 text-gray-600">{e.category || "-"}</td>
                <td className="py-2.5 px-4 text-right text-red-600 font-medium">UGX {e.amount.toLocaleString()}</td>
                <td className="py-2.5 px-4 text-gray-600">{e.expense_date ? new Date(e.expense_date).toLocaleDateString() : "-"}</td>
                <td className="py-2.5 px-4">
                  <button onClick={() => handleDelete(e.id, e.description)} className="text-red-500 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  )
}
