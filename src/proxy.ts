import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || "dev-wanplan-session-secret-change-me")
const COOKIE_NAME = "wanplan_session"
const LOGIN = "/wans/login"
const PUBLIC = "/wans"

const PUBLIC_PATHS = ["/", PUBLIC, "/login", "/signup", "/api/auth/login", "/api/auth/signup"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public paths pass through
  if (PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    // API routes return 401 JSON, pages redirect to login
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    return NextResponse.redirect(new URL(LOGIN, request.url))
  }

  try {
    await jwtVerify(token, SECRET)
    return NextResponse.next()
  } catch {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 })
    }
    const res = NextResponse.redirect(new URL(LOGIN, request.url))
    res.cookies.delete(COOKIE_NAME)
    return res
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|offline).*)"],
}