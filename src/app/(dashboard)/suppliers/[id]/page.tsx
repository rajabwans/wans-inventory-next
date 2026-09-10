"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import DashboardShell from "@/components/DashboardShell"
import Link from "next/link"

interface Supplier {
  id: number
  name: string
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
}

interface Purchase {
  id: number
  purchase_date: string
  total_amount: number
  note: string | null
  created_at: string
}

export default function SupplierDetailPage() {
  const params = useParams()
  const id = params.id
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([
      fetch(`/wans/api/suppliers/${id}`).then((r) => r.json()),
      fetch("/wans/api/purchases").then((r) => r.json()),
    ]).then(([sup, allPurchases]) => {
      if (sup?.error) throw new Error(sup.error)
      setSupplier(sup)
      const supplierPurchases = (allPurchases || []).filter((p: any) => p.supplier_id === Number(id))
      setPurchases(supplierPurchases)
    }).catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Loading...</div></DashboardShell>
  if (error) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-red-500">{error}</div></DashboardShell>
  if (!supplier) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Supplier not found</div></DashboardShell>

  const totalSpent = purchases.reduce((sum, p) => sum + (Number(p.total_amount) || 0), 0)

  return (
    <DashboardShell businessName="" role="">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/suppliers" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <h1 className="text-2xl font-bold">{supplier.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">Contact Info</h2>
          <div className="space-y-2 text-sm">
            <div><span className="text-gray-400">Phone:</span> {supplier.phone || "-"}</div>
            <div><span className="text-gray-400">Email:</span> {supplier.email || "-"}</div>
            <div><span className="text-gray-400">Address:</span> {supplier.address || "-"}</div>
            {supplier.notes && <div><span className="text-gray-400">Notes:</span> {supplier.notes}</div>}
          </div>
          <div className="mt-4">
            <Link href={`/suppliers/add?id=${supplier.id}`} className="text-indigo-600 hover:underline text-xs">Edit Supplier</Link>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">Total Purchases</h2>
          <div className="text-2xl font-bold">{purchases.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">Total Spent</h2>
          <div className="text-2xl font-bold">{totalSpent.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Purchase History</h2>
          <Link href="/purchases/add" className="text-indigo-600 hover:underline text-sm">New Purchase</Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Total</th>
              <th className="py-3 px-4">Note</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 && (
              <tr><td colSpan={4} className="py-12 text-center text-gray-400">No purchases from this supplier.</td></tr>
            )}
            {purchases.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 last:border-0">
                <td className="py-2.5 px-4">
                  <Link href={`/purchases/${p.id}`} className="text-indigo-600 hover:underline">#{p.id}</Link>
                </td>
                <td className="py-2.5 px-4">{p.purchase_date ? new Date(p.purchase_date).toLocaleDateString() : "-"}</td>
                <td className="py-2.5 px-4 text-right">{Number(p.total_amount).toLocaleString()}</td>
                <td className="py-2.5 px-4 text-gray-600">{p.note || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  )
}
