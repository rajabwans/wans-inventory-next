"use client"

import { useEffect, useState } from "react"
import DashboardShell from "@/components/DashboardShell"

interface BillingInfo {
  business: {
    id: number
    name: string
    plan: string
    status: string
    paid_until: string | null
    trial_ends_at: string | null
    upgrade_requested: number | null
    upgrade_note: string | null
    upgrade_requested_at: string | null
  }
  plan: {
    effective: string
    trial_ends_at: string | null
    paid_until: string | null
    upgrade_requested: boolean
    upgrade_note: string | null
    upgrade_requested_at: string | null
  }
}

export default function BillingPage() {
  const [info, setInfo] = useState<BillingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [txRef, setTxRef] = useState("")
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState("")

  useEffect(() => {
    fetch("/api/billing")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => setInfo(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault()
    if (!txRef) return
    setSubmitting(true)
    setMsg("")

    const res = await fetch("/api/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transaction_ref: txRef, note }),
    })

    if (res.ok) {
      setMsg("Upgrade request submitted successfully!")
      setTxRef("")
      setNote("")
      fetch("/api/billing")
        .then((r) => r.json())
        .then((d) => setInfo(d))
    } else {
      const data = await res.json()
      setMsg(data.error || "Failed to submit request")
    }
    setSubmitting(false)
  }

  if (loading) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Loading billing info...</div></DashboardShell>
  if (error) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-red-500">{error}</div></DashboardShell>
  if (!info) return null

  const { business, plan } = info
  const isExpired = plan.effective === "expired"
  const isTrial = plan.effective === "trial"
  const isPro = plan.effective === "pro"

  const trialEnd = plan.trial_ends_at ? new Date(plan.trial_ends_at) : null
  const paidEnd = plan.paid_until ? new Date(plan.paid_until) : null

  return (
    <DashboardShell businessName={business.name} role="">
      <h1 className="text-2xl font-bold mb-6">Billing</h1>

      {isExpired && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          Your plan has expired. Please upgrade to continue using all features.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Current Plan</h2>
          <div className="text-3xl font-bold capitalize mb-1">{isPro ? "Pro" : isTrial ? "Trial" : "Expired"}</div>
          <p className="text-sm text-gray-500">
            {isPro && paidEnd && `Paid until ${paidEnd.toLocaleDateString()}`}
            {isTrial && trialEnd && `Trial ends ${trialEnd.toLocaleDateString()}`}
            {isExpired && "No active plan"}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Pro Plan</h2>
          <div className="text-3xl font-bold text-indigo-600 mb-1">UGX 15,000</div>
          <p className="text-sm text-gray-500">per month</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Payment Instructions</h2>
        <p className="text-sm text-gray-700 mb-2">
          Send <strong>UGX 15,000</strong> via Mobile Money to:
        </p>
        <p className="text-lg font-bold text-indigo-600 mb-4">0763750114</p>
        <p className="text-sm text-gray-500">
          After payment, fill in the form below with your transaction reference.
        </p>
      </div>

      {plan.upgrade_requested && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg mb-6 text-sm">
          Your upgrade request is pending review.
          {plan.upgrade_requested_at && ` Submitted on ${new Date(plan.upgrade_requested_at).toLocaleDateString()}.`}
        </div>
      )}

      {!plan.upgrade_requested && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Request Upgrade</h2>

          {msg && (
            <div className={`px-4 py-2 rounded-lg text-sm mb-4 ${msg.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
              {msg}
            </div>
          )}

          <form onSubmit={handleRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Reference</label>
              <input
                type="text"
                value={txRef}
                onChange={(e) => setTxRef(e.target.value)}
                required
                placeholder="e.g. MP240101.1234.A12345"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Upgrade Request"}
            </button>
          </form>
        </div>
      )}
    </DashboardShell>
  )
}
