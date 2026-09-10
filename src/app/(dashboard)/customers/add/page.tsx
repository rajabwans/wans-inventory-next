"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import DashboardShell from "@/components/DashboardShell"
import Link from "next/link"

export default function Page() {
  return <Suspense fallback={null}><AddCustomerPage /></Suspense>
}

function AddCustomerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("id")

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (editId) {
      fetch(`/wans/api/customers/${editId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d && !d.error) {
            setName(d.name || "")
            setPhone(d.phone || "")
            setEmail(d.email || "")
            setAddress(d.address || "")
          }
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [editId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const url = editId ? `/api/customers/${editId}` : "/api/customers"
      const method = editId ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone: phone || null, email: email || null, address: address || null }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to save")
      }
      router.push("/customers")
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
          <Link href="/customers" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-2xl font-bold">{editId ? "Edit Customer" : "Add Customer"}</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {saving ? "Saving..." : editId ? "Update Customer" : "Create Customer"}
            </button>
            <Link href="/customers" className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</Link>
          </div>
        </form>
      </div>
    </DashboardShell>
  )
}
