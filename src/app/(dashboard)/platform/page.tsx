"use client"

import { useEffect, useState } from "react"
import DashboardShell from "@/components/DashboardShell"

interface Business {
  id: number
  name: string
  slug: string
  plan: string
  status: string
  created_at: string
  trial_ends_at: string | null
  paid_until: string | null
  upgrade_requested: number | null
  upgrade_note: string | null
}

const statusBadge: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  suspended: "bg-red-100 text-red-700",
  rejected: "bg-gray-100 text-gray-500",
}

export default function PlatformPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [planModal, setPlanModal] = useState<number | null>(null)
  const [planPaidUntil, setPlanPaidUntil] = useState("")
  const [planTrialEnds, setPlanTrialEnds] = useState("")

  function fetchBusinesses() {
    fetch("/wans/api/platform")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => setBusinesses(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchBusinesses() }, [])

  async function action(url: string, id: number) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    if (res.ok) fetchBusinesses()
  }

  async function handleSetPlan(id: number) {
    const body: Record<string, unknown> = { id, plan: "pro" }
    if (planPaidUntil) body.paid_until = planPaidUntil
    if (planTrialEnds) body.trial_ends_at = planTrialEnds

    const res = await fetch("/wans/api/platform/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      setPlanModal(null)
      setPlanPaidUntil("")
      setPlanTrialEnds("")
      fetchBusinesses()
    }
  }

  if (loading) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Loading platform data...</div></DashboardShell>
  if (error) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-red-500">{error}</div></DashboardShell>

  return (
    <DashboardShell businessName="" role="">
      <h1 className="text-2xl font-bold mb-6">Platform Management</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <th className="py-3 px-4">Business</th>
              <th className="py-3 px-4">Slug</th>
              <th className="py-3 px-4">Plan</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4">Trial Ends</th>
              <th className="py-3 px-4">Paid Until</th>
              <th className="py-3 px-4">Upgrade</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {businesses.length === 0 && (
              <tr><td colSpan={9} className="py-12 text-center text-gray-400">No businesses found.</td></tr>
            )}
            {businesses.map((b) => (
              <tr key={b.id} className="border-b border-gray-50 last:border-0">
                <td className="py-2.5 px-4 font-medium">{b.name}</td>
                <td className="py-2.5 px-4 text-gray-500 text-xs">{b.slug}</td>
                <td className="py-2.5 px-4 capitalize">{b.plan}</td>
                <td className="py-2.5 px-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge[b.status] || "bg-gray-100 text-gray-500"}`}>
                    {b.status}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-gray-500 text-xs">{new Date(b.created_at).toLocaleDateString()}</td>
                <td className="py-2.5 px-4 text-gray-500 text-xs">{b.trial_ends_at ? new Date(b.trial_ends_at).toLocaleDateString() : "-"}</td>
                <td className="py-2.5 px-4 text-gray-500 text-xs">{b.paid_until ? new Date(b.paid_until).toLocaleDateString() : "-"}</td>
                <td className="py-2.5 px-4">
                  {b.upgrade_requested ? (
                    <span className="inline-block w-3 h-3 bg-amber-400 rounded-full" title="Upgrade requested" />
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-1 flex-wrap">
                    {b.status !== "active" && (
                      <button onClick={() => action("/api/platform/approve", b.id)} className="text-green-600 hover:underline text-xs px-1">Approve</button>
                    )}
                    {b.status !== "suspended" && b.status !== "rejected" && (
                      <button onClick={() => action("/api/platform/suspend", b.id)} className="text-amber-600 hover:underline text-xs px-1">Suspend</button>
                    )}
                    {b.status !== "rejected" && (
                      <button onClick={() => action("/api/platform/reject", b.id)} className="text-red-500 hover:underline text-xs px-1">Reject</button>
                    )}
                    <button onClick={() => { setPlanModal(b.id); setPlanPaidUntil(b.paid_until ? b.paid_until.split("T")[0] : ""); setPlanTrialEnds(b.trial_ends_at ? b.trial_ends_at.split("T")[0] : "") }} className="text-indigo-600 hover:underline text-xs px-1">Plan</button>
                    {b.upgrade_requested ? (
                      <button onClick={() => action("/api/platform/clear-upgrade", b.id)} className="text-gray-500 hover:underline text-xs px-1">Clear</button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {planModal !== null && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setPlanModal(null) }}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Set Pro Plan for Business #{planModal}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paid Until</label>
                <input
                  type="date"
                  value={planPaidUntil}
                  onChange={(e) => setPlanPaidUntil(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trial Ends At (optional)</label>
                <input
                  type="date"
                  value={planTrialEnds}
                  onChange={(e) => setPlanTrialEnds(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <p className="text-xs text-gray-500">Setting plan=pro and clearing upgrade request.</p>
              <div className="flex gap-3">
                <button onClick={() => handleSetPlan(planModal)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Confirm</button>
                <button onClick={() => setPlanModal(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
