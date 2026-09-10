import bcrypt from "bcryptjs"
import { scryptSync, timingSafeEqual } from "crypto"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored) return false

  if (stored.startsWith("$2")) {
    return bcrypt.compare(password, stored)
  }

  if (stored.startsWith("scrypt:")) {
    try {
      const head = stored.split("$")[0]
      const salt = stored.split("$")[1]
      const hexHash = stored.split("$")[2]
      const parts = head.split(":")
      if (parts[0] !== "scrypt" || parts.length !== 4) return false
      const [n, r, p] = parts.slice(1).map(Number)
      const expected = Buffer.from(hexHash, "hex")
      const derived = scryptSync(password, salt, expected.length, {
        N: n,
        r: r,
        p: p,
        maxmem: 2147483647,
      })
      return timingSafeEqual(derived, expected)
    } catch {
      return false
    }
  }

  if (stored.startsWith("pbkdf2:")) {
    try {
      const [method, iterations] = stored.split("$")[0].split(":")
      const salt = stored.split("$")[1]
      const hexHash = stored.split("$")[2]
      void method
      const expected = Buffer.from(hexHash, "hex")
      const { pbkdf2Sync } = await import("crypto")
      const derived = pbkdf2Sync(password, salt, Number(iterations), expected.length, "sha256")
      return timingSafeEqual(derived, expected)
    } catch {
      return false
    }
  }

  return false
}