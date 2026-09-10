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
  upgrade_proof: string | null
  upgrade_requested_at: string | null
}

const statusBadge: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  suspended: "bg-red-100 text-red-700",
  rejected: "bg-gray-100 text-gray-500",
}

function parseUpgradeNote(raw: string | null): { ref: string; note: string } {
  if (!raw) return { ref: "", note: "" }
  try {
    const parsed = JSON.parse(raw)
    return { ref: parsed.ref || "", note: parsed.note || "" }
  } catch {
    return { ref: raw, note: "" }
  }
}

export default function PlatformPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [planModal, setPlanModal] = useState<number | null>(null)
  const [planPaidUntil, setPlanPaidUntil] = useState("")
  const [planTrialEnds, setPlanTrialEnds] = useState("")
  const [upgradeBiz, setUpgradeBiz] = useState<Business | null>(null)

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

  async function handleConfirmPayment(b: Business) {
    setUpgradeBiz(null)
    setPlanModal(b.id)
    setPlanPaidUntil(b.paid_until ? b.paid_until.split("T")[0] : "")
    setPlanTrialEnds(b.trial_ends_at ? b.trial_ends_at.split("T")[0] : "")
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
                    <button onClick={() => setUpgradeBiz(b)} className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 text-xs font-medium" title="View upgrade request">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.5 5 7.5-5" stroke="none" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h14a2 2 0 012 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.5 5 7.5-5" /></svg>
                      Review
                    </button>
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

      {upgradeBiz && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setUpgradeBiz(null) }}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">Upgrade Request</h2>
                <p className="text-sm text-gray-500">{upgradeBiz.name} ({upgradeBiz.slug})</p>
              </div>
              <button onClick={() => setUpgradeBiz(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>

            {(() => {
              const { ref, note } = parseUpgradeNote(upgradeBiz.upgrade_note)
              return (
                <div className="space-y-3 text-sm mb-4">
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Transaction Ref</div>
                    <div className="font-medium">{ref || "-"}</div>
                  </div>
                  {upgradeBiz.upgrade_requested_at && (
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Submitted</div>
                      <div className="font-medium">{new Date(upgradeBiz.upgrade_requested_at).toLocaleString()}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Note</div>
                    <div className="text-gray-700">{note || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Payment Proof</div>
                    {upgradeBiz.upgrade_proof ? (
                      <img
                        src={`/wans/api/uploads?file=${encodeURIComponent(upgradeBiz.upgrade_proof)}`}
                        alt="Payment proof"
                        className="w-full rounded-lg border border-gray-100 mt-1"
                      />
                    ) : (
                      <div className="text-gray-400 text-sm">No proof uploaded</div>
                    )}
                  </div>
                </div>
              )
            })()}

            <div className="flex gap-3">
              <button onClick={() => handleConfirmPayment(upgradeBiz)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                Confirm payment &#8594; set plan
              </button>
              <button onClick={() => action("/api/platform/clear-upgrade", upgradeBiz.id)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

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
