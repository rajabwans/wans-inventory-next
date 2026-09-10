"use client"

import { useEffect, useState } from "react"
import DashboardShell from "@/components/DashboardShell"

interface Item {
  title: string
  qty: number
  expiry_date: string
  days_left: number
}

export default function ExpiringPage() {
  const [expiring, setExpiring] = useState<Item[]>([])
  const [expired, setExpired] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [days, setDays] = useState(30)

  function fetchReport(d: number) {
    setLoading(true)
    setError("")
    fetch(`/wans/api/reports/expiring?days=${d}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => { setExpiring(d.expiring); setExpired(d.expired) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchReport(days) }, [])

  function handleApply(e: React.FormEvent) {
    e.preventDefault()
    fetchReport(days)
  }

  if (loading) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Loading report...</div></DashboardShell>
  if (error) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-red-500">{error}</div></DashboardShell>

  return (
    <DashboardShell businessName="" role="">
      <h1 className="text-2xl font-bold mb-6">Expiring Stock</h1>

      <form onSubmit={handleApply} className="flex gap-3 mb-6 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Days ahead</label>
          <input type="number" min="1" value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Apply</button>
      </form>

      {expired.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-red-600">Already Expired ({expired.length})</h2>
          <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4 text-right">Qty</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4 text-right">Days Overdue</th>
                </tr>
              </thead>
              <tbody>
                {expired.map((item, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0 bg-red-50">
                    <td className="py-2.5 px-4 font-medium">{item.title}</td>
                    <td className="py-2.5 px-4 text-right">{item.qty}</td>
                    <td className="py-2.5 px-4 text-red-600">{item.expiry_date}</td>
                    <td className="py-2.5 px-4 text-right text-red-600 font-medium">{Math.abs(item.days_left)} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Expiring in {days} Days ({expiring.length})</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4 text-right">Qty</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4 text-right">Days Left</th>
              </tr>
            </thead>
            <tbody>
              {expiring.length === 0 && (
                <tr><td colSpan={4} className="py-12 text-center text-gray-400">No expiring stock found.</td></tr>
              )}
              {expiring.map((item, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0">
                  <td className="py-2.5 px-4 font-medium">{item.title}</td>
                  <td className="py-2.5 px-4 text-right">{item.qty}</td>
                  <td className="py-2.5 px-4 text-amber-600">{item.expiry_date}</td>
                  <td className="py-2.5 px-4 text-right">{item.days_left} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  )
}
