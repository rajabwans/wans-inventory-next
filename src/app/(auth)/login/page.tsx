"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [slug, setSlug] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      const res = await fetch("/wans/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, username, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Login failed")
      router.push(data.redirect || "/dashboard")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <a className="auth-brand text-white mb-5 text-decoration-none" href="/wans" style={{ display: "flex", alignItems: "center", gap: "1rem", fontWeight: 700, fontSize: "1.1rem" }}>
          <span className="auth-logo" style={{ width: 74, height: 74, borderRadius: 22, padding: 6 }}>
            <img src="/wans/wanplan/logo.svg" alt="WANPLAN" style={{ display: "block", height: "100%", width: "100%" }} />
          </span>
          <span className="lh-sm">
            <span className="d-block fw-bolder brand-text-glow" style={{ fontSize: "2.6rem", letterSpacing: "-.04em", lineHeight: 1 }}>WANPLAN</span>
            <span className="d-block" style={{ fontSize: ".8rem", opacity: .72, letterSpacing: ".16em", textTransform: "uppercase", marginTop: ".2rem" }}>wanland planner</span>
          </span>
        </a>
        <div className="mb-4">
          <h2 className="fw-bold text-white mb-3">Inventory done right.</h2>
          <p className="opacity-75 mb-4">Manage products, sales, customers, expenses and profits — all in one clean workspace.</p>
          <div className="row g-2">
            <div className="col-6"><div className="feature-tile"><i className="bi bi-box-seam"></i><p>Track stock in real time</p></div></div>
            <div className="col-6"><div className="feature-tile"><i className="bi bi-cart"></i><p>Record sales in seconds</p></div></div>
            <div className="col-6"><div className="feature-tile"><i className="bi bi-people"></i><p>Keep your customers</p></div></div>
            <div className="col-6"><div className="feature-tile"><i className="bi bi-graph-up"></i><p>Understand your profit</p></div></div>
          </div>
        </div>
        <div className="small opacity-50">© {new Date().getFullYear()} WANPLAN</div>
      </aside>
      <main className="auth-main">
        <div className="auth-card">
          <div className="text-center mb-4 d-lg-none">
            <div className="auth-logo mx-auto mb-2" style={{ width: 76, height: 76, padding: 7, borderRadius: 20 }}>
              <img src="/wans/wanplan/logo.svg" alt="WANPLAN" />
            </div>
            <div className="fw-bolder" style={{ fontSize: "2.1rem", lineHeight: 1, letterSpacing: "-.04em" }}>WANPLAN</div>
            <div className="small text-muted text-uppercase" style={{ letterSpacing: ".16em" }}>wanland planner</div>
          </div>
          <div className="text-center mb-4">
            <h2 className="mb-1">Welcome back</h2>
            <p className="lead mb-0">Sign in to your business workspace</p>
          </div>
          {error && <div className="alert alert-danger alert-dismissible fade show">{error}</div>}
          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label">Business slug</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-building"></i></span>
                <input type="text" className="form-control" placeholder="e.g. wans" value={slug} onChange={(e) => setSlug(e.target.value)} required />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-person"></i></span>
                <input type="text" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label">Password</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-lock"></i></span>
                <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="btn btn-brand w-100 py-2" disabled={busy}>
              <i className="bi bi-box-arrow-in-right me-1"></i>{busy ? "Signing in..." : "Sign in"}
            </button>
            <p className="text-center text-muted small mt-3 mb-0">
              New business? <a href="/wans/signup" className="fw-semibold">Create your workspace</a>
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}