"use client"

import { useEffect, useState } from "react"
import DashboardShell from "@/components/DashboardShell"
import Link from "next/link"

interface Customer {
  id: number
  name: string
  phone: string | null
  email: string | null
  address: string | null
  created_at: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  function fetchCustomers(q?: string) {
    const url = q ? `/api/customers?search=${encodeURIComponent(q)}` : "/api/customers"
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => setCustomers(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCustomers() }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    fetchCustomers(search)
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete customer "${name}"?`)) return
    const res = await fetch(`/api/customers/${id}`, { method: "DELETE" })
    if (res.ok) setCustomers((prev) => prev.filter((c) => c.id !== id))
  }

  if (loading) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Loading customers...</div></DashboardShell>
  if (error) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-red-500">{error}</div></DashboardShell>

  return (
    <DashboardShell businessName="" role="">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Link href="/customers/add" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Customer
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input type="text" placeholder="Search by name, phone, or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
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
            {customers.length === 0 && (
              <tr><td colSpan={5} className="py-12 text-center text-gray-400">No customers found.</td></tr>
            )}
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-gray-50 last:border-0">
                <td className="py-2.5 px-4 font-medium">{c.name}</td>
                <td className="py-2.5 px-4 text-gray-600">{c.phone || "-"}</td>
                <td className="py-2.5 px-4 text-gray-600">{c.email || "-"}</td>
                <td className="py-2.5 px-4 text-gray-600">{c.address || "-"}</td>
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-2">
                    <Link href={`/customers/${c.id}`} className="text-indigo-600 hover:underline text-xs">View</Link>
                    <Link href={`/customers/add?id=${c.id}`} className="text-indigo-600 hover:underline text-xs">Edit</Link>
                    <button onClick={() => handleDelete(c.id, c.name)} className="text-red-500 hover:underline text-xs">Delete</button>
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
