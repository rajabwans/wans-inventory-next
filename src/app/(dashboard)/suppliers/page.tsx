"use client"

import { useEffect, useState } from "react"
import DashboardShell from "@/components/DashboardShell"
import Link from "next/link"

interface Supplier {
  id: number
  name: string
  phone: string | null
  email: string | null
  address: string | null
  created_at: string
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  function fetchSuppliers(q?: string) {
    const url = q ? `/api/suppliers?search=${encodeURIComponent(q)}` : "/api/suppliers"
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => setSuppliers(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSuppliers() }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    fetchSuppliers(search)
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete supplier "${name}"?`)) return
    const res = await fetch(`/wans/api/suppliers/${id}`, { method: "DELETE" })
    if (res.ok) setSuppliers((prev) => prev.filter((s) => s.id !== id))
  }

  if (loading) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Loading suppliers...</div></DashboardShell>
  if (error) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-red-500">{error}</div></DashboardShell>

  return (
    <DashboardShell businessName="" role="">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <Link href="/suppliers/add" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Supplier
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search suppliers..."
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
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Address</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 && (
              <tr><td colSpan={5} className="py-12 text-center text-gray-400">No suppliers found.</td></tr>
            )}
            {suppliers.map((s) => (
              <tr key={s.id} className="border-b border-gray-50 last:border-0">
                <td className="py-2.5 px-4 font-medium">{s.name}</td>
                <td className="py-2.5 px-4 text-gray-600">{s.phone || "-"}</td>
                <td className="py-2.5 px-4 text-gray-600">{s.email || "-"}</td>
                <td className="py-2.5 px-4 text-gray-600">{s.address || "-"}</td>
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-2">
                    <Link href={`/suppliers/${s.id}`} className="text-indigo-600 hover:underline text-xs">View</Link>
                    <Link href={`/suppliers/add?id=${s.id}`} className="text-indigo-600 hover:underline text-xs">Edit</Link>
                    <button onClick={() => handleDelete(s.id, s.name)} className="text-red-500 hover:underline text-xs">Delete</button>
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
