import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || "dev-wanplan-session-secret-change-me")

export const COOKIE_NAME = "wanplan_session"

export interface SessionData {
  user_id: number
  business_id: number
  username: string
  role: string
  expires: string
}

export async function createSession(userId: number, businessId: number, username: string, role: string) {
  const expires = new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours
  const token = await new SignJWT({ user_id: userId, business_id: businessId, username, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(SECRET)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  })
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, SECRET)
    return {
      user_id: payload.user_id as number,
      business_id: payload.business_id as number,
      username: payload.username as string,
      role: payload.role as string,
      expires: payload.exp ? String(payload.exp) : "",
    }
  } catch {
    return null
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function requireAuth(): Promise<SessionData> {
  const session = await getSession()
  if (!session) {
    throw new Error("UNAUTHORIZED")
  }
  return session
}