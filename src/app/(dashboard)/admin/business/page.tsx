"use client"

import { useEffect, useState } from "react"
import DashboardShell from "@/components/DashboardShell"

export default function BusinessSettingsPage() {
  const [name, setName] = useState("")
  const [currency, setCurrency] = useState("UGX")
  const [about, setAbout] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")
  const [err, setErr] = useState("")

  useEffect(() => {
    fetch("/api/admin/business")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => {
        setName(d.name || "")
        setCurrency(d.currency || "UGX")
        setAbout(d.about || "")
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMsg("")
    setErr("")

    const res = await fetch("/api/admin/business", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, currency, about }),
    })

    if (res.ok) {
      setMsg("Saved successfully")
      localStorage.setItem("wanplan_biz_name", name)
    } else {
      const data = await res.json()
      setErr(data.error || "Failed to save")
    }
    setSaving(false)
  }

  if (loading) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Loading...</div></DashboardShell>

  return (
    <DashboardShell businessName={name} role="">
      <h1 className="text-2xl font-bold mb-6">Business Settings</h1>

      <form onSubmit={handleSave} className="max-w-lg space-y-5">
        {msg && <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm">{msg}</div>}
        {err && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">{err}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="UGX">UGX - Ugandan Shilling</option>
            <option value="USD">USD - US Dollar</option>
            <option value="KES">KES - Kenyan Shilling</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </DashboardShell>
  )
}
