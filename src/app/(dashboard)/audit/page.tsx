"use client"

import { useEffect, useState } from "react"
import DashboardShell from "@/components/DashboardShell"

interface AuditEntry {
  id: number
  user_id: number
  username: string
  action: string
  table_name: string
  record_id: number
  details: string | null
  ip_address: string | null
  created_at: string
}

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/audit")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => setEntries(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function actionBadge(action: string) {
    switch (action) {
      case "create": return "bg-green-100 text-green-700"
      case "delete": return "bg-red-100 text-red-700"
      case "update": return "bg-blue-100 text-blue-700"
      case "till": return "bg-purple-100 text-purple-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  if (loading) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Loading audit log...</div></DashboardShell>
  if (error) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-red-500">{error}</div></DashboardShell>

  return (
    <DashboardShell businessName="" role="">
      <h1 className="text-2xl font-bold mb-6">Audit Log</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Table</th>
              <th className="py-3 px-4">Record ID</th>
              <th className="py-3 px-4">Details</th>
              <th className="py-3 px-4">IP</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr><td colSpan={7} className="py-12 text-center text-gray-400">No audit entries found.</td></tr>
            )}
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-gray-50 last:border-0">
                <td className="py-2.5 px-4 text-gray-600 text-xs">{new Date(e.created_at).toLocaleString()}</td>
                <td className="py-2.5 px-4 font-medium">{e.username}</td>
                <td className="py-2.5 px-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${actionBadge(e.action)}`}>
                    {e.action}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-gray-600">{e.table_name}</td>
                <td className="py-2.5 px-4 text-gray-600">{e.record_id}</td>
                <td className="py-2.5 px-4 text-gray-600 text-xs max-w-xs truncate">{e.details || "-"}</td>
                <td className="py-2.5 px-4 text-gray-400 text-xs">{e.ip_address || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  )
}
