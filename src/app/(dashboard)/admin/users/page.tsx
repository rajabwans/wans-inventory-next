"use client"

import { useEffect, useState } from "react"
import DashboardShell from "@/components/DashboardShell"
import Link from "next/link"

interface User {
  id: number
  username: string
  full_name: string
  role: string
  created_at: string
}

const roleBadge: Record<string, string> = {
  superadmin: "bg-purple-100 text-purple-700",
  admin: "bg-indigo-100 text-indigo-700",
  manager: "bg-blue-100 text-blue-700",
  staff: "bg-gray-100 text-gray-600",
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  function fetchUsers() {
    fetch("/wans/api/admin/users")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => setUsers(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [])

  async function handleDelete(id: number, username: string) {
    if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return
    const res = await fetch(`/wans/api/admin/users/${id}`, { method: "DELETE" })
    if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  if (loading) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Loading users...</div></DashboardShell>
  if (error) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-red-500">{error}</div></DashboardShell>

  return (
    <DashboardShell businessName="" role="">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <Link
          href="/admin/users/add"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add User
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <th className="py-3 px-4">Username</th>
              <th className="py-3 px-4">Full Name</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={5} className="py-12 text-center text-gray-400">No users found.</td></tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-50 last:border-0">
                <td className="py-2.5 px-4 font-medium">{u.username}</td>
                <td className="py-2.5 px-4 text-gray-600">{u.full_name}</td>
                <td className="py-2.5 px-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleBadge[u.role] || "bg-gray-100 text-gray-600"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/users/add?id=${u.id}`} className="text-indigo-600 hover:underline text-xs">Edit</Link>
                    <button onClick={() => handleDelete(u.id, u.username)} className="text-red-500 hover:underline text-xs">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  )
}
