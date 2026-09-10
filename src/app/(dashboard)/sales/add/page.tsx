"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardShell from "@/components/DashboardShell"
import Link from "next/link"

interface Product {
  id: number
  title: string
  selling_price: number
  buying_price: number
  quantity: number
}

interface Customer {
  id: number
  name: string
  phone: string | null
}

export default function AddSalePage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [productId, setProductId] = useState("")
  const [quantitySold, setQuantitySold] = useState("1")
  const [unitPrice, setUnitPrice] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [amountPaid, setAmountPaid] = useState("")
  const [customerId, setCustomerId] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split("T")[0])

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/customers").then((r) => r.json()),
    ]).then(([prods, custs]) => {
      setProducts(prods || [])
      setCustomers(custs || [])
    }).catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function handleProductChange(id: string) {
    setProductId(id)
    const product = products.find((p) => p.id === Number(id))
    if (product) setUnitPrice(String(product.selling_price))
  }

  const selectedProduct = products.find((p) => p.id === Number(productId))
  const total = (Number(unitPrice) || 0) * (Number(quantitySold) || 0)
  const remaining = total - (Number(amountPaid) || 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: Number(productId),
          quantity_sold: Number(quantitySold),
          unit_price: Number(unitPrice),
          payment_method: paymentMethod,
          amount_paid: Number(amountPaid) || 0,
          customer_id: customerId ? Number(customerId) : null,
          customer_name: customerId ? null : customerName || null,
          due_date: dueDate || null,
          sale_date: saleDate,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create sale")
      router.push("/sales")
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
          <Link href="/sales" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-2xl font-bold">New Sale</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
            <select required value={productId} onChange={(e) => handleProductChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.title} (Stock: {p.quantity})</option>
              ))}
            </select>
          </div>

          {selectedProduct && selectedProduct.quantity < Number(quantitySold) && (
            <div className="bg-amber-50 text-amber-700 text-sm px-4 py-2 rounded-lg">
              Only {selectedProduct.quantity} units available
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input type="number" min="1" required value={quantitySold} onChange={(e) => setQuantitySold(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price *</label>
              <input type="number" step="any" required value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-gray-500">Total</span>
            <span className="font-semibold">{total.toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
              <select required value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="cash">Cash</option>
                <option value="momo">Mobile Money</option>
                <option value="card">Card</option>
                <option value="credit">Credit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid</label>
              <input type="number" step="any" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>

          {Number(amountPaid) > 0 && Number(amountPaid) < total && (
            <div className="bg-amber-50 text-amber-700 text-sm px-4 py-2 rounded-lg">
              Remaining: {remaining.toLocaleString()}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Walk-in</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}{c.phone ? ` (${c.phone})` : ""}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Walk-in Name</label>
              <input type="text" disabled={!!customerId} value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Optional" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sale Date</label>
              <input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            {paymentMethod === "credit" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving || (selectedProduct && Number(quantitySold) > selectedProduct.quantity)} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {saving ? "Processing..." : "Complete Sale"}
            </button>
            <Link href="/sales" className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</Link>
          </div>
        </form>
      </div>
    </DashboardShell>
  )
}
