import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { requireAuth } from "@/lib/session"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
}

export async function GET(req: NextRequest) {
  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const file = req.nextUrl.searchParams.get("file") || ""
  const safe = path.basename(file)
  if (!safe.startsWith("proof_") || safe !== file) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const match = safe.match(/^proof_(\d+)_/)
  if (!match) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const ownerBid = Number(match[1])

  const { data: business } = await supabase
    .from("businesses")
    .select("upgrade_proof")
    .eq("id", ownerBid)
    .single()

  const isOwner = session.business_id === ownerBid && business?.upgrade_proof === safe
  const isSuperadmin = session.role === "superadmin"
  if (!isOwner && !isSuperadmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const uploadsDir = path.join(process.cwd(), "uploads")
  const filePath = path.join(uploadsDir, safe)
  if (!fs.existsSync(filePath)) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const ext = (safe.split(".").pop() || "").toLowerCase()
  const data = fs.readFileSync(filePath)
  return new NextResponse(data, {
    headers: {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "private, max-age=300",
    },
  })
}