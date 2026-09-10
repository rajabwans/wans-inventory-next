"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"

interface NavItem {
  name: string
  href: string
  icon: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: "M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10" },
  { name: "Products", href: "/products", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { name: "Sales", href: "/sales", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { name: "Customers", href: "/customers", icon: "M17 20h5v-2a3 3 0 00-5-4.5M9 20h6M14 7a3 3 0 11-6 0 3 3 0 016 0zM4 18a3 3 0 013-3h6a3 3 0 013 3v2" },
  { name: "Suppliers", href: "/suppliers", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { name: "Purchases", href: "/purchases", icon: "M3 3h18v18H3V3zm3-3v18M3 9h18M9 9v12M15 9v12" },
  { name: "Expenses", href: "/expenses", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a1 1 0 110-2 1 1 0 010-2z" },
  { name: "Billing", href: "/billing", icon: "M3 10h18M7 15h2m4 0h4M3 6a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" },
]

const dropdowns: NavGroup[] = [
  {
    label: "Bills",
    items: [
      { name: "Debtors (Credit)", href: "/reports/debtors", icon: "M17 20h5v-2a3 3 0 00-5-4.5M9 20h6M14 7a3 3 0 11-6 0 3 3 0 016 0z" },
      { name: "Till Reconciliation", href: "/reports/till", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2m-5-5l6 6m0-6v6" },
      { name: "Returns & Refunds", href: "/returns", icon: "M11 15l-3 3 3 3m0-6v6m6-14l3 3-3 3m0-6v6M5 5l4 4m0 0l-4 4" },
      { name: "Invoice History", href: "/invoices", icon: "M9 12h6m-6 4h6M9 8h6m-3-6a9 9 0 100 18 9 9 0 000-18z" },
    ],
  },
  {
    label: "Reports",
    items: [
      { name: "Stock Valuation", href: "/reports/stock", icon: "M9 17v-2m3 2v-4m3 4V9m3 8V5M5 17v-6" },
      { name: "Sales Report", href: "/reports/sales", icon: "M8 13V5m8 8V3m-8 16v-4m8 4V11M8 15a3 3 0 100-6 3 3 0 000 6zm8 4a3 3 0 100-6 3 3 0 000 6z" },
      { name: "Profit & Loss", href: "/reports/profit-loss", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
      { name: "Expiring Stock", href: "/reports/expiring", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
      { name: "Audit Log", href: "/audit", icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    ],
  },
  {
    label: "Admin",
    items: [
      { name: "Categories", href: "/categories", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
      { name: "Stock Adjustments", href: "/stock/adjustments", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
      { name: "Business Settings", href: "/admin/business", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35" },
      { name: "Manage Users", href: "/admin/users", icon: "M16 11V6a4 4 0 00-8 0v5m-2 8h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" },
      { name: "All Businesses", href: "/platform", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    ],
  },
]

export default function DashboardShell({ children, businessName, role }: { children: React.ReactNode; businessName: string; role: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [bizName, setBizName] = useState(businessName)
  const menuRef = useRef<HTMLDivElement>(null)
  const ddRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem("wanplan_biz_name")
    if (stored) setBizName(stored)
  }, [])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) setOpenDropdown(null)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  async function logout() {
    await fetch("/wans/api/auth/logout", { method: "POST" })
    localStorage.removeItem("wanplan_biz_name")
    router.push("/login")
    router.refresh()
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation bar */}
      <nav className="bg-gradient-to-r from-[#17153b] to-[#1e1b4b] text-white sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-4 px-4 lg:px-6 py-2.5">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`lg:hidden p-2 rounded-lg hover:bg-white/10 ${menuOpen ? "bg-white/10" : ""}`}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>

          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
              W
            </div>
            <span className="leading-tight hidden xs:flex sm:flex flex-col">
              <small className="text-[0.6rem] tracking-[0.16em] font-extrabold opacity-70 uppercase">wanland planner</small>
              <span className="font-bold leading-none">{bizName || "Wans"}</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center flex-1 min-w-0 justify-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition ${
                  isActive(item.href) ? "bg-white/15 text-white font-semibold" : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.name}
              </Link>
            ))}
            {dropdowns.map((dd) => (
              <div key={dd.label} className="relative" ref={ddRef}>
                <button
                  onClick={() => setOpenDropdown(openDropdown === dd.label ? null : dd.label)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition ${
                    dd.items.some((i) => isActive(i.href)) ? "bg-white/15 text-white font-semibold" : "text-white/85 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {dd.label}
                  <svg className="w-3.5 h-3.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={openDropdown === dd.label ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                  </svg>
                </button>
                {openDropdown === dd.label && (
                  <div className="absolute left-0 top-full mt-1 w-64 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    {dd.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpenDropdown(null)}
                        className={`flex items-center gap-2.5 px-4 py-2 text-sm ${isActive(item.href) ? "text-indigo-700 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
                      >
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                        </svg>
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2 shrink-0">
            <span className="hidden md:inline text-xs px-3 py-1 rounded-full bg-white/10 capitalize">{role}</span>
            <button
              onClick={logout}
              className="text-sm px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div ref={menuRef} className="lg:hidden fixed inset-0 z-30 bg-black/40" onClick={(e) => { if (e.target === e.currentTarget) setMenuOpen(false) }}>
          <aside className="w-72 h-full bg-white shadow-xl overflow-y-auto max-h-screen">
            <nav className="p-3 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                    isActive(item.href) ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {item.name}
                </Link>
              ))}
              {dropdowns.map((group) => (
                <div key={group.label}>
                  <div className="px-3 text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">{group.label}</div>
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                          isActive(item.href) ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                        </svg>
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Content */}
      <main className="container-fluid px-4 lg:px-6 py-6 mx-auto max-w-7xl">
        {children}
      </main>
    </div>
  )
}