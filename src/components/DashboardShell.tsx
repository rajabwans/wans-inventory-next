"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"

export default function DashboardShell({ children, businessName, role, currency }: { children: React.ReactNode; businessName: string; role: string; currency?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [openDd, setOpenDd] = useState<string | null>(null)
  const [bizName, setBizName] = useState(businessName)
  const [locked, setLocked] = useState<string | null>(null)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem("wanplan_biz_name")
    if (stored) setBizName(stored)
  }, [])

  useEffect(() => {
    fetch("/wans/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((me: { role?: string; status?: string; effective?: string } | null) => {
        if (!me || me.role === "superadmin") return
        if (me.status === "pending") {
          setLocked("pending")
          return
        }
        if (me.status === "suspended") {
          logout()
          return
        }
        if (me.effective === "expired" && !pathname.startsWith("/billing") && !pathname.startsWith("/platform")) {
          router.replace("/billing")
          setLocked("expired")
        }
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenDd(null)
    }
    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [])

  async function logout() {
    await fetch("/wans/api/auth/logout", { method: "POST" })
    localStorage.removeItem("wanplan_biz_name")
    router.push("/login")
    router.refresh()
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  const navItem = (href: string, icon: string, label: string) => (
    <Link href={href} className={`nav-link${isActive(href) ? " active" : ""}`}>
      <i className={icon}></i>{label}
    </Link>
  )

  const ddToggle = (key: string, icon: string, label: string) => (
    <a className="nav-link dropdown-toggle" href="#!" role="button" id={`dd-${key}`} data-bs-toggle="dropdown"
       onClick={(e) => { e.preventDefault(); setOpenDd(openDd === key ? null : key) }}>
      <i className={icon}></i>{label}
    </a>
  )

  const ddItem = (href: string, icon: string, label: string) => (
    <Link key={href} href={href} className="dropdown-item" onClick={() => setOpenDd(null)}>
      <i className={icon}></i>{label}
    </Link>
  )

  return (
    <div id="appShell">
      <nav ref={navRef} className="topnav navbar navbar-expand-lg navbar-dark sticky-top">
        <div className="container-fluid px-3">
          <Link className="navbar-brand" href="/dashboard">
            <span className="brand-mark">
              <img src="/wans/wanplan/logo.svg" alt="WANPLAN" style={{ height: "100%", width: "100%" }} />
            </span>
            <span className="lh-sm d-flex flex-column justify-content-center">
              <small style={{ fontSize: ".6rem", letterSpacing: ".16em", fontWeight: 800, opacity: .6, textTransform: "uppercase" }}>wanland planner</small>
              <span style={{ fontSize: "1.05rem", lineHeight: 1.1 }}>{bizName || "WANPLAN"}</span>
            </span>
          </Link>
          <button className="navbar-toggler" type="button" aria-label="Toggle navigation"
                  onClick={() => setCollapsed(!collapsed)}>
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={`collapse navbar-collapse${collapsed ? " show" : ""}`} id="navbarNav">
            <ul className="navbar-nav me-auto">
              {navItem("/dashboard", "bi bi-speedometer2", "Dashboard")}
              {navItem("/products", "bi bi-box-seam", "Products")}
              {navItem("/sales", "bi bi-cart", "Sales")}
              {navItem("/customers", "bi bi-people", "Customers")}
              {navItem("/suppliers", "bi bi-truck", "Suppliers")}
              {navItem("/purchases", "bi bi-bag", "Purchases")}
              <li className={`nav-item dropdown${openDd === "bills" ? " show" : ""}`}>
                {ddToggle("bills", "bi bi-bar-chart", "Bills")}
                <ul className={`dropdown-menu${openDd === "bills" ? " show" : ""}`}>
                  {ddItem("/reports/debtors", "bi bi-people", "Debtors (Credit)")}
                  {ddItem("/reports/till", "bi bi-cash-stack", "Till Reconciliation")}
                  {ddItem("/returns", "bi bi-arrow-return-left", "Returns & Refunds")}
                  {ddItem("/reports/expiring", "bi bi-hourglass-split", "Expiry Monitor")}
                </ul>
              </li>
              {navItem("/expenses", "bi bi-receipt", "Expenses")}
              {navItem("/billing", "bi bi-credit-card", "Billing")}
              <li className={`nav-item dropdown${openDd === "reports" ? " show" : ""}`}>
                {ddToggle("reports", "bi bi-file-earmark-bar-graph", "Reports")}
                <ul className={`dropdown-menu${openDd === "reports" ? " show" : ""}`}>
                  {ddItem("/reports/stock", "bi bi-box-seam", "Stock Valuation")}
                  {ddItem("/reports/sales", "bi bi-graph-up", "Sales Report")}
                  {ddItem("/reports/profit-loss", "bi bi-cash-stack", "Profit & Loss")}
                  {ddItem("/reports/expiring", "bi bi-hourglass-split", "Expiring Stock")}
                </ul>
              </li>
              <li className={`nav-item dropdown${openDd === "admin" ? " show" : ""}`}>
                {ddToggle("admin", "bi bi-gear", "Admin")}
                <ul className={`dropdown-menu${openDd === "admin" ? " show" : ""}`}>
                  {ddItem("/admin/business", "bi bi-building-gear", "Business Settings")}
                  {ddItem("/categories", "bi bi-tags", "Categories")}
                  {ddItem("/admin/users", "bi bi-people-fill", "Users")}
                  {ddItem("/stock/adjustments", "bi bi-arrow-left-right", "Stock Adjustments")}
                  {ddItem("/audit", "bi bi-journal-text", "Audit Log")}
                </ul>
              </li>
              {navItem("/platform", "bi bi-globe2", "All Businesses")}
            </ul>
            <div className="d-flex align-items-center gap-2">
              <span className="text-light small me-1 d-none d-md-inline">
                <i className="bi bi-person-circle"></i> {bizName}
                <span className="badge bg-secondary ms-1">{role}</span>
              </span>
              <button className="btn btn-outline-light btn-sm" onClick={logout}>
                <i className="bi bi-box-arrow-right"></i> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div id="appBody">
        <div className="container-fluid px-3 px-lg-4 py-4">
          {locked === "pending" ? (
            <div className="max-w-md mx-auto text-center py-20">
              <div className="text-5xl mb-4">⏳</div>
              <h2 className="text-xl font-bold mb-2">Awaiting Approval</h2>
              <p className="text-gray-500 text-sm">
                Your business is still awaiting approval by the administrator. You&apos;ll be able to use WANPLAN once it&apos;s approved.
              </p>
            </div>
          ) : locked === "expired" ? (
            <div className="max-w-md mx-auto text-center py-20">
              <div className="text-5xl mb-4">🔒</div>
              <h2 className="text-xl font-bold mb-2">Plan Expired</h2>
              <p className="text-gray-500 text-sm">
                Your free trial has ended. Activate Pro to continue using WANPLAN.
              </p>
              <Link href="/billing" className="mt-4 inline-block px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                Go to Billing
              </Link>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  )
}