"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import DashboardShell from "@/components/DashboardShell"
import Link from "next/link"

interface Customer {
  id: number
  name: string
  phone: string | null
  email: string | null
  address: string | null
}

interface Sale {
  id: number
  product_title: string
  quantity_sold: number
  total_amount: number
  amount_paid: number
  payment_status: string
  sale_date: string
}

export default function CustomerDetailPage() {
  const params = useParams()
  const id = params.id
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([
      fetch(`/wans/api/customers/${id}`).then((r) => r.json()),
      fetch(`/wans/api/sales`).then((r) => r.json()),
    ]).then(([cust, allSales]) => {
      if (cust?.error) throw new Error(cust.error)
      setCustomer(cust)
      const customerSales = (allSales || []).filter((s: any) => s.customer_id === Number(id) || s.customer_display === cust.name)
      setSales(customerSales)
    }).catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Loading...</div></DashboardShell>
  if (error) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-red-500">{error}</div></DashboardShell>
  if (!customer) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Customer not found</div></DashboardShell>

  const totalDebt = sales.reduce((sum, s) => sum + ((Number(s.total_amount) || 0) - (Number(s.amount_paid) || 0)), 0)
  const unpaidSales = sales.filter((s) => s.payment_status !== "paid")

  return (
    <DashboardShell businessName="" role="">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/customers" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <h1 className="text-2xl font-bold">{customer.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">Contact Info</h2>
          <div className="space-y-2 text-sm">
            <div><span className="text-gray-400">Phone:</span> {customer.phone || "-"}</div>
            <div><span className="text-gray-400">Email:</span> {customer.email || "-"}</div>
            <div><span className="text-gray-400">Address:</span> {customer.address || "-"}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">Total Sales</h2>
          <div className="text-2xl font-bold">{sales.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">Outstanding Debt</h2>
          <div className={`text-2xl font-bold ${totalDebt > 0 ? "text-red-600" : "text-green-600"}`}>{totalDebt.toLocaleString()}</div>
        </div>
      </div>

      {unpaidSales.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Outstanding Debts</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Product</th>
                <th className="py-2 px-4 text-right">Total</th>
                <th className="py-2 px-4 text-right">Paid</th>
                <th className="py-2 px-4 text-right">Due</th>
                <th className="py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {unpaidSales.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 px-4">{s.sale_date ? new Date(s.sale_date).toLocaleDateString() : "-"}</td>
                  <td className="py-2 px-4">{s.product_title}</td>
                  <td className="py-2 px-4 text-right">{Number(s.total_amount).toLocaleString()}</td>
                  <td className="py-2 px-4 text-right">{Number(s.amount_paid).toLocaleString()}</td>
                  <td className="py-2 px-4 text-right text-red-600 font-semibold">{((Number(s.total_amount) || 0) - (Number(s.amount_paid) || 0)).toLocaleString()}</td>
                  <td className="py-2 px-4"><span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">{s.payment_status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold">All Sales</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4 text-right">Qty</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-right">Paid</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 && (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">No sales found.</td></tr>
            )}
            {sales.map((s) => (
              <tr key={s.id} className="border-b border-gray-50 last:border-0">
                <td className="py-2.5 px-4">{s.sale_date ? new Date(s.sale_date).toLocaleDateString() : "-"}</td>
                <td className="py-2.5 px-4 font-medium">{s.product_title}</td>
                <td className="py-2.5 px-4 text-right">{s.quantity_sold}</td>
                <td className="py-2.5 px-4 text-right">{Number(s.total_amount).toLocaleString()}</td>
                <td className="py-2.5 px-4 text-right">{Number(s.amount_paid).toLocaleString()}</td>
                <td className="py-2.5 px-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    s.payment_status === "paid" ? "bg-green-100 text-green-700" :
                    s.payment_status === "partial" ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  }`}>{s.payment_status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  )
}
