"use client"

import { useEffect, useState } from "react"
import DashboardShell from "@/components/DashboardShell"
import Link from "next/link"

interface Biz {
  name: string
  currency: string
  plan: string
}

interface Stats {
  total_products: number
  total_stock: number
  total_invested: number
  total_sales_amount: number
  total_profit: number
  total_possible_profit: number
  total_customers: number
  owing_total: number
  debtor_count: number
  expiring_count: number
  expired_count: number
  purchase_total: number
  monthly_profit: number
  monthly_expenses: number
  recent_sales_count: number
  recovery: number
}

function money(n: number | string, cur = "UGX") {
  const v = Number(n) || 0
  return `${cur} ${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/wans/api/dashboard")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => {
        setData(d)
        if (d.biz?.name) localStorage.setItem("wanplan_biz_name", d.biz.name)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))

    const el = document.getElementById("currentDate")
    if (el) el.textContent = new Date().toLocaleDateString("en-UG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  }, [])

  if (loading) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-muted">Loading dashboard...</div></DashboardShell>
  if (error || !data) return <DashboardShell businessName="" role=""><div className="text-center py-20 text-danger">{error || "Could not load dashboard"}</div></DashboardShell>

  const s: Stats = data.stats
  const cur = data.biz?.currency || "UGX"
  const bizName: string = data.biz?.name || ""
  const plan: string = data.biz?.plan || data.plan || ""

  const total_cogs = s.total_sales_amount - s.total_profit
  const capital_deployed = total_cogs + s.total_invested
  let recovered = capital_deployed > 0 ? (total_cogs / capital_deployed) * 100 : 0
  if (recovered > 100) recovered = 100
  if (recovered < 0) recovered = 0

  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 })

  return (
    <DashboardShell businessName={bizName} role={plan} currency={cur}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0"><i className="bi bi-speedometer2"></i> Executive Dashboard</h3>
          <p className="text-muted small mb-0">{bizName} — Inventory Performance Overview</p>
        </div>
        <span className="text-muted small" id="currentDate"></span>
      </div>

      <div className="row g-3 mb-4">
        <Link href="/products" className="col-6 col-lg-3 text-decoration-none">
          <div className="card stat-card shadow-sm h-100">
            <div className="card-body d-flex justify-content-between align-items-start gap-2">
              <div>
                <span className="stat-label">Total Products</span>
                <h3 className="stat-value mb-1">{fmt(s.total_products)}</h3>
                <p className="small text-muted mb-0">{money(s.total_invested, cur)} invested</p>
              </div>
              <span className="stat-icon indigo"><i className="bi bi-box-seam"></i></span>
            </div>
          </div>
        </Link>
        <Link href="/products" className="col-6 col-lg-3 text-decoration-none">
          <div className="card stat-card shadow-sm h-100">
            <div className="card-body d-flex justify-content-between align-items-start gap-2">
              <div>
                <span className="stat-label">Stock Units</span>
                <h3 className="stat-value mb-1">{fmt(s.total_stock)}</h3>
                <p className="small text-muted mb-0">Units across all products</p>
              </div>
              <span className="stat-icon violet"><i className="bi bi-archive"></i></span>
            </div>
          </div>
        </Link>
        <Link href="/sales" className="col-6 col-lg-3 text-decoration-none">
          <div className="card stat-card shadow-sm h-100">
            <div className="card-body d-flex justify-content-between align-items-start gap-2">
              <div>
                <span className="stat-label">Total Revenue</span>
                <h3 className="stat-value mb-1">{money(s.total_sales_amount, cur)}</h3>
                <p className="small text-muted mb-0">{s.recent_sales_count || 0} transactions</p>
              </div>
              <span className="stat-icon sky"><i className="bi bi-graph-up-arrow"></i></span>
            </div>
          </div>
        </Link>
        <Link href="/sales" className="col-6 col-lg-3 text-decoration-none">
          <div className="card stat-card shadow-sm h-100">
            <div className="card-body d-flex justify-content-between align-items-start gap-2">
              <div>
                <span className="stat-label">Net Profit</span>
                <h3 className="stat-value mb-1">{money(s.total_profit, cur)}</h3>
                <p className="small text-muted mb-0">
                  {s.total_sales_amount > 0 ? `${((s.total_profit / s.total_sales_amount) * 100).toFixed(1)}% margin` : "No sales yet"}
                </p>
              </div>
              <span className="stat-icon emerald"><i className="bi bi-cash-stack"></i></span>
            </div>
          </div>
        </Link>
      </div>

      <div className="row g-3 mb-4">
        <Link href="/products" className="col-6 col-lg-3 text-decoration-none">
          <div className="card stat-card shadow-sm h-100">
            <div className="card-body d-flex justify-content-between align-items-start gap-2">
              <div>
                <span className="stat-label">Capital Invested</span>
                <h4 className="stat-value mb-1">{money(s.total_invested, cur)}</h4>
                <p className="small text-muted mb-0">Total buying cost of stock</p>
              </div>
              <span className="stat-icon slate"><i className="bi bi-bank"></i></span>
            </div>
          </div>
        </Link>
        <div className="col-6 col-lg-3">
          <div className="card stat-card shadow-sm h-100">
            <div className="card-body d-flex justify-content-between align-items-start gap-2">
              <div>
                <span className="stat-label">This Month</span>
                <h4 className="stat-value mb-1">{money(s.monthly_profit - s.monthly_expenses, cur)}</h4>
                <p className="small text-muted mb-0">Rev {money(s.monthly_profit, cur)} · Exp {money(s.monthly_expenses, cur)}</p>
              </div>
              <span className="stat-icon amber"><i className="bi bi-calendar-month"></i></span>
            </div>
          </div>
        </div>
        <Link href="/products" className="col-6 col-lg-3 text-decoration-none">
          <div className="card stat-card shadow-sm h-100">
            <div className="card-body d-flex justify-content-between align-items-start gap-2">
              <div>
                <span className="stat-label">Expected Profit</span>
                <h4 className="stat-value text-success mb-1">{money(s.total_possible_profit, cur)}</h4>
                <p className="small text-muted mb-0">If all stock sells at listed price</p>
              </div>
              <span className="stat-icon teal"><i className="bi bi-graph-up"></i></span>
            </div>
          </div>
        </Link>
        <Link href="/sales" className="col-6 col-lg-3 text-decoration-none">
          <div className="card stat-card shadow-sm h-100">
            <div className="card-body d-flex justify-content-between align-items-start gap-2">
              <div>
                <span className="stat-label">Capital Recovery</span>
                <h4 className="stat-value mb-1">{recovered.toFixed(1)}%</h4>
                <div className="progress mt-1" style={{ height: 6 }}>
                  <div className="progress-bar bg-success" style={{ width: `${recovered.toFixed(1)}%` }}></div>
                </div>
                <p className="small text-muted mb-0">{fmt(total_cogs)} {cur} recovered of {fmt(capital_deployed)} {cur} deployed</p>
              </div>
              <span className="stat-icon rose"><i className="bi bi-arrow-repeat"></i></span>
            </div>
          </div>
        </Link>
        <Link href="/products" className="col-6 col-lg-3 text-decoration-none">
          <div className="card stat-card shadow-sm h-100">
            <div className="card-body d-flex justify-content-between align-items-start gap-2">
              <div>
                <span className="stat-label">Low Stock Items</span>
                <h4 className={`stat-value ${data.low_stock?.length > 0 ? "text-danger" : "text-success"} mb-1`}>{data.low_stock?.length || 0}</h4>
                <p className="small text-muted mb-0">Items with 5 or fewer units</p>
              </div>
              <span className={`stat-icon ${data.low_stock?.length > 0 ? "red" : "emerald"}`}><i className="bi bi-exclamation-triangle"></i></span>
            </div>
          </div>
        </Link>
      </div>

      <div className="row g-3 mb-4">
        <Link href="/sales" className="col-6 col-lg-3 text-decoration-none">
          <div className="card stat-card shadow-sm h-100">
            <div className="card-body d-flex justify-content-between align-items-start gap-2">
              <div>
                <span className="stat-label">Receivables (Credit)</span>
                <h4 className={`stat-value ${s.owing_total > 0 ? "text-danger" : "text-success"} mb-1`}>{money(s.owing_total, cur)}</h4>
                <p className="small text-muted mb-0">{s.debtor_count} invoice{s.debtor_count !== 1 ? "s" : ""} owing · <a className="text-decoration-none" href="/reports/debtors">Debtors</a></p>
              </div>
              <span className={`stat-icon ${s.owing_total > 0 ? "red" : "emerald"}`}><i className="bi bi-people"></i></span>
            </div>
          </div>
        </Link>
        <Link href="/purchases" className="col-6 col-lg-3 text-decoration-none">
          <div className="card stat-card shadow-sm h-100">
            <div className="card-body d-flex justify-content-between align-items-start gap-2">
              <div>
                <span className="stat-label">Purchases (total)</span>
                <h4 className="stat-value mb-1">{money(s.purchase_total, cur)}</h4>
                <p className="small text-muted mb-0">All suppliers combined</p>
              </div>
              <span className="stat-icon indigo"><i className="bi bi-bag"></i></span>
            </div>
          </div>
        </Link>
        <Link href="/reports/till" className="col-6 col-lg-3 text-decoration-none">
          <div className="card stat-card shadow-sm h-100">
            <div className="card-body d-flex justify-content-between align-items-start gap-2">
              <div>
                <span className="stat-label">Expiring / Expired</span>
                <h4 className={`stat-value ${s.expired_count > 0 ? "text-danger" : s.expiring_count > 0 ? "text-warning" : "text-success"} mb-1`}>{fmt(s.expiring_count)} <small>/ {fmt(s.expired_count)}</small></h4>
                <p className="small text-muted mb-0">Units expiring(30d) / expired</p>
              </div>
              <span className={`stat-icon ${s.expired_count > 0 ? "red" : s.expiring_count > 0 ? "amber" : "emerald"}`}><i className="bi bi-hourglass-split"></i></span>
            </div>
          </div>
        </Link>
        <Link href="/expenses" className="col-6 col-lg-3 text-decoration-none">
          <div className="card stat-card shadow-sm h-100">
            <div className="card-body d-flex justify-content-between align-items-start gap-2">
              <div>
                <span className="stat-label">Expenses</span>
                <h4 className="stat-value mb-1">{money(s.monthly_expenses, cur)}</h4>
                <p className="small text-muted mb-0">This month · <a className="text-decoration-none" href="/reports/till">Till</a> · <a className="text-decoration-none" href="/reports/expiring">Expiry</a></p>
              </div>
              <span className="stat-icon slate"><i className="bi bi-cash-stack"></i></span>
            </div>
          </div>
        </Link>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <strong><i className="bi bi-exclamation-triangle text-warning"></i> Low Stock Alert</strong>
              <a href="/products" className="btn btn-sm btn-outline-dark"><i className="bi bi-eye"></i> View All</a>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead className="table-light"><tr><th>Product</th><th>Qty</th><th>Value at Cost</th><th>Action</th></tr></thead>
                  <tbody>
                    {(data.low_stock || []).map((item: any) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td><span className="badge bg-danger">{item.quantity}</span></td>
                        <td>{money(item.quantity * item.buying_price, cur)}</td>
                        <td><a href={`/products/edit?id=${item.id}`} className="btn btn-sm btn-outline-primary">Restock</a></td>
                      </tr>
                    ))}
                    {(!data.low_stock || data.low_stock.length === 0) && (
                      <tr><td colSpan={4} className="text-center text-muted py-4"><i className="bi bi-check-circle text-success fs-5"></i> All products are well stocked</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {data.category_breakdown && data.category_breakdown.length > 0 && (
            <div className="card shadow-sm mt-3">
              <div className="card-header bg-white">
                <strong><i className="bi bi-pie-chart"></i> Category Breakdown</strong>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-sm mb-0">
                    <thead className="table-light"><tr><th>Category</th><th>Products</th><th>Stock</th><th>Value</th></tr></thead>
                    <tbody>
                      {data.category_breakdown.map((cat: any, i: number) => (
                        <tr key={i}>
                          <td><strong>{cat.category || "Uncategorized"}</strong></td>
                          <td>{cat.count}</td>
                          <td>{cat.stock}</td>
                          <td>{money(cat.value, cur)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <strong><i className="bi bi-clock-history"></i> Recent Transactions</strong>
              <a href="/sales" className="btn btn-sm btn-outline-dark"><i className="bi bi-eye"></i> View All</a>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead className="table-light"><tr><th>Product</th><th>Qty</th><th>Amount</th><th>Profit</th><th>Date</th></tr></thead>
                  <tbody>
                    {(data.recent_sales || []).map((sale: any, i: number) => (
                      <tr key={i}>
                        <td>{sale.title || sale.product_title}</td>
                        <td>{sale.quantity_sold}</td>
                        <td>{money(sale.total_amount, cur)}</td>
                        <td className="text-success fw-bold">+{money(sale.profit, cur)}</td>
                        <td className="small text-muted">{String(sale.sale_date).slice(0, 10)}</td>
                      </tr>
                    ))}
                    {(!data.recent_sales || data.recent_sales.length === 0) && (
                      <tr><td colSpan={5} className="text-center text-muted py-4"><i className="bi bi-inbox fs-5"></i> No sales recorded yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {data.top_products && data.top_products.length > 0 && (
            <div className="card shadow-sm mt-3">
              <div className="card-header bg-white">
                <strong><i className="bi bi-trophy"></i> Top Selling Products</strong>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-sm mb-0">
                    <thead className="table-light"><tr><th>#</th><th>Product</th><th>Units Sold</th><th>Revenue</th></tr></thead>
                    <tbody>
                      {data.top_products.map((t: any, i: number) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td><strong>{t.title}</strong></td>
                          <td>{t.total_sold}</td>
                          <td>{money(t.revenue, cur)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}