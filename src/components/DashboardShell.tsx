"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"

const navGroups = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: "M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10" },
    ],
  },
  {
    label: "Inventory",
    items: [
      { name: "Products", href: "/products", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
      { name: "Categories", href: "/categories", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
      { name: "Stock Adjustments", href: "/stock/adjustments", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
    ],
  },
  {
    label: "Sales",
    items: [
      { name: "Sales", href: "/sales", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
      { name: "Returns", href: "/returns", icon: "M11 15l-3 3 3 3m0-6v6m6-14l3 3-3 3m0-6v6M5 5l4 4m0 0l-4 4" },
      { name: "Customers", href: "/customers", icon: "M17 20h5v-2a3 3 0 00-5-4.5M9 20h6M14 7a3 3 0 11-6 0 3 3 0 016 0zM4 18a3 3 0 013-3h6a3 3 0 013 3v2" },
      { name: "Invoices", href: "/invoices", icon: "M9 12h6m-6 4h6M9 8h6m-3-6a9 9 0 100 18 9 9 0 000-18z" },
    ],
  },
  {
    label: "Procurement",
    items: [
      { name: "Suppliers", href: "/suppliers", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
      { name: "Purchases", href: "/purchases", icon: "M3 3h18v18H3V3zm3-3v18M3 9h18M9 9v12M15 9v12" },
    ],
  },
  {
    label: "Money",
    items: [
      { name: "Expenses", href: "/expenses", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a1 1 0 110 2 1 1 0 010-2z" },
      { name: "Debtors", href: "/reports/debtors", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
      { name: "Till Report", href: "/reports/till", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2m-5-5l6 6m0 0v-6" },
      { name: "Billing", href: "/billing", icon: "M3 10h18M7 15h2m4 0h4M3 6a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" },
    ],
  },
  {
    label: "Reports",
    items: [
      { name: "Stock Report", href: "/reports/stock", icon: "M9 17v-2m3 2v-4m3 4V9m3 8V5M5 17v-6" },
      { name: "Sales Report", href: "/reports/sales", icon: "M8 13V5m8 8V3m-8 16v-4m8 4V11M8 15a3 3 0 100-6 3 3 0 000 6zm8 4a3 3 0 100-6 3 3 0 000 6z" },
      { name: "Profit & Loss", href: "/reports/profit-loss", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
      { name: "Expiring Stock", href: "/reports/expiring", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
      { name: "Audit Log", href: "/audit", icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    ],
  },
  {
    label: "Admin",
    items: [
      { name: "Business Settings", href: "/admin/business", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
      { name: "Manage Users", href: "/admin/users", icon: "M16 11V6a4 4 0 00-8 0v5m-2 8h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" },
    ],
  },
]

export default function DashboardShell({ children, businessName, role }: { children: React.ReactNode; businessName: string; role: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [bizName, setBizName] = useState(businessName)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem("wanplan_biz_name")
    if (stored) setBizName(stored)
  }, [])

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    localStorage.removeItem("wanplan_biz_name")
    router.push("/login")
    router.refresh()
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <header className="bg-[#1e1b4b] text-white sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`lg:hidden p-2 rounded-lg hover:bg-white/10 ${menuOpen ? "bg-white/10" : ""}`}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">
              W
            </div>
            <span className="font-semibold tracking-tight">WANPLAN</span>
            <span className="hidden sm:inline text-sm opacity-60 mx-1">&middot;</span>
            <span className="hidden sm:inline text-sm opacity-90 truncate max-w-[200px]">{bizName}</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden md:inline text-xs px-3 py-1 rounded-full bg-white/10 capitalize">{role}</span>
            <button
              onClick={logout}
              className="text-sm px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-60px)]">
        {/* Sidebar - mobile overlay */}
        {menuOpen && (
          <div ref={menuRef} className="lg:hidden fixed inset-0 z-30 bg-black/40" onClick={(e) => { if (e.target === e.currentTarget) setMenuOpen(false) }}>
            <aside className="w-64 h-full bg-white shadow-xl overflow-y-auto max-h-screen">
              <nav className="p-3 space-y-5">
                {navGroups.map((group) => (
                  <div key={group.label}>
                    <div className="px-3 text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">{group.label}</div>
                    <div className="space-y-0.5">
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                            isActive(item.href)
                              ? "bg-indigo-50 text-indigo-700 font-medium"
                              : "text-gray-600 hover:bg-gray-100"
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

        {/* Sidebar - desktop */}
        <aside className="hidden lg:block w-60 bg-white border-r border-gray-200 overflow-y-auto max-h-[calc(100vh-60px)] sticky top-[60px]">
          <nav className="p-3 space-y-5">
            {navGroups.map((group) => (
              <div key={group.label}>
                <div className="px-3 text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">{group.label}</div>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                        isActive(item.href)
                          ? "bg-indigo-50 text-indigo-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
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

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}