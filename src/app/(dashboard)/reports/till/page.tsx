"use client"

import { useEffect, useState } from "react"
import DashboardShell from "@/components/DashboardShell"

interface MethodEntry {
  total: number
  count: number
}

interface Closure {
  id: number
  close_date: string
  cash_counted: number
  momo_counted: number
  card_counted: number
  note: string | null
  closed_by: number
  created_at: string
}

export default function TillReportPage() {
  const [salesTotal, setSalesTotal] = useState(0)
  const [count, setCount] = useState(0)
  const [byMethod, setByMethod] = useState<Record<string, MethodEntry>>({})
  const [creditTotal, setCreditTotal] = useState(0)
  const [closures, setClosures] = useState<Closure[]>([])
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showClose, setShowClose] = useState(false)
  const [cashCounted, setCashCounted] = useState("")
  const [momoCounted, setMomoCounted] = useState("")
  const [cardCounted, setCardCounted] = useState("")
  const [closeNote, setCloseNote] = useState("")
  const [closing, setClosing] = useState(false)
  const [closeError, setCloseError] = useState("")
  const [closeSuccess, setCloseSuccess] = useState(false)

  function fetchReport(d: string) {
    setLoading(true)
    setError("")
    fetch(`/api/reports/till?date=${d}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => {
        setSalesTotal(d.sales_total)
        setCount(d.count)
        setByMethod(d.by_method)
        setCreditTotal(d.credit_total)
        setClosures(d.closures)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchReport(date) }, [])

  function handleDateChange(e: React.FormEvent) {
    e.preventDefault()
    fetchReport(date)
  }

  async function handleClose(e: React.FormEvent) {
    e.preventDefault()
    setClosing(true)
    setCloseError("")
    setCloseSuccess(false)

    try {
      const res = await fetch("/api/reports/till/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cash_counted: Number(cashCounted) || 0, momo_counted: Number(momoCounted) || 0, card_counted: Number(cardCounted) || 0, note: closeNote || null }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed")
      }
      setCloseSuccess(true)
      setCashCounted("")
      setMomoCounted("")
      setCardCounted("")
      setCloseNote("")
      setShowClose(false)
      fetchReport(date)
    } catch (e: any) {
      setCloseError(e.message)
    } finally {
      setClosing(false)
    }
  }

  return (
    <DashboardShell businessName="" role="">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Till Report</h1>
        <button onClick={() => { setShowClose(!showClose); setCloseSuccess(false); setCloseError("") }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
          Close Till
        </button>
      </div>

      {closeSuccess && <div className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-lg mb-4">Till closed successfully.</div>}

      {showClose && (
        <form onSubmit={handleClose} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 space-y-4">
          <h2 className="text-lg font-semibold">Close Till for Today</h2>
          {closeError && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{closeError}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cash Counted (UGX)</label>
              <input type="number" min="0" value={cashCounted} onChange={(e) => setCashCounted(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MoMo Counted (UGX)</label>
              <input type="number" min="0" value={momoCounted} onChange={(e) => setMomoCounted(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Counted (UGX)</label>
              <input type="number" min="0" value={cardCounted} onChange={(e) => setCardCounted(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <input type="text" value={closeNote} onChange={(e) => setCloseNote(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Optional note" />
          </div>
          <button type="submit" disabled={closing} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {closing ? "Saving..." : "Confirm Close"}
          </button>
        </form>
      )}

      <form onSubmit={handleDateChange} className="flex gap-3 mb-6 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <button type="submit" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Load</button>
      </form>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading report...</div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Sales Total</div>
              <div className="text-xl font-bold">UGX {salesTotal.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Transactions</div>
              <div className="text-xl font-bold">{count}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Credit Outstanding</div>
              <div className="text-xl font-bold text-amber-600">UGX {creditTotal.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">By Method</div>
              <div className="space-y-1 mt-2">
                {Object.entries(byMethod).map(([m, v]) => (
                  <div key={m} className="flex justify-between text-sm">
                    <span className="capitalize text-gray-600">{m}</span>
                    <span className="font-medium">UGX {v.total.toLocaleString()} ({v.count})</span>
                  </div>
                ))}
                {Object.keys(byMethod).length === 0 && <span className="text-gray-400 text-xs">No sales</span>}
              </div>
            </div>
          </div>

          {closures.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Till Closures</h2>
              <div className="space-y-3">
                {closures.map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <div className="text-sm font-medium">{new Date(c.close_date).toLocaleDateString()}</div>
                      {c.note && <div className="text-xs text-gray-400">{c.note}</div>}
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>Cash: UGX {c.cash_counted.toLocaleString()}</span>
                      <span>MoMo: UGX {c.momo_counted.toLocaleString()}</span>
                      <span>Card: UGX {c.card_counted.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </DashboardShell>
  )
}
