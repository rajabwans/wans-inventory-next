"use client"

import { useEffect, useState, Suspense } from "react"
import DashboardShell from "@/components/DashboardShell"
import { useRouter, useSearchParams } from "next/navigation"

export default function Page() {
  return <Suspense fallback={null}><AddUserPage /></Suspense>
}

function AddUserPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("id")

  const [username, setUsername] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState("staff")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(!!editId)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState("")

  useEffect(() => {
    if (!editId) return
    fetch("/wans/api/admin/users")
      .then((r) => r.json())
      .then((users) => {
        const u = users.find((x: { id: number }) => x.id === Number(editId))
        if (u) {
          setUsername(u.username)
          setFullName(u.full_name)
          setRole(u.role)
        }
      })
      .finally(() => setLoading(false))
  }, [editId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErr("")

    if (editId) {
      const body: Record<string, unknown> = { full_name: fullName, role }
      if (password) body.password = password

      const res = await fetch(`/wans/api/admin/users/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        router.push("/admin/users")
      } else {
        const data = await res.json()
        setErr(data.error || "Failed to update user")
      }
    } else {
      if (!password) {
        setErr("Password is required for new users")
        setSaving(false)
        return
      }

      const res = await fetch("/wans/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, full_name: fullName, role, password }),
      })

      if (res.ok) {
        router.push("/admin/users")
      } else {
        const data = await res.json()
        setErr(data.error || "Failed to create user")
      }
    }
    setSaving(false)
  }

  if (loading) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-gray-400">Loading...</div></DashboardShell>

  return (
    <DashboardShell businessName="" role="">
      <h1 className="text-2xl font-bold mb-6">{editId ? "Edit User" : "Add User"}</h1>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
        {err && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">{err}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={!!editId}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password {editId ? "(leave blank to keep current)" : ""}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!editId}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : editId ? "Update User" : "Create User"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/users")}
            className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </DashboardShell>
  )
}
