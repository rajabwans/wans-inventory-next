import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import fs from "fs"
import path from "path"
import { requireAuth } from "@/lib/session"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

const ALLOWED_EXT = ["png", "jpg", "jpeg", "webp", "gif"]
const MAX_SIZE = 5 * 1024 * 1024
const uploadsDir = path.join(process.cwd(), "uploads")

function ensureUploadsDir() {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

function deleteProofFile(filename: string) {
  const safe = path.basename(filename)
  try {
    fs.unlinkSync(path.join(uploadsDir, safe))
  } catch {
    // ignore
  }
}

export async function POST(req: NextRequest) {
  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const bid = session.business_id
  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: "Invalid request" }, { status: 400 })

  const txRef = String(form.get("transaction_ref") || "")
  const note = String(form.get("note") || "")
  if (!txRef) {
    return NextResponse.json({ error: "Transaction reference is required" }, { status: 400 })
  }

  const proofFile = form.get("proof")
  let proofName: string | null = null
  let proofData: Buffer | null = null

  if (proofFile && proofFile instanceof File) {
    if (proofFile.size > MAX_SIZE) {
      return NextResponse.json({ error: "Proof image must be 5MB or smaller" }, { status: 400 })
    }
    const ext = (proofFile.name.split(".").pop() || "").toLowerCase()
    if (!ALLOWED_EXT.includes(ext)) {
      return NextResponse.json({ error: "Proof image must be PNG, JPG, JPEG, WEBP or GIF" }, { status: 400 })
    }
    proofData = Buffer.from(await proofFile.arrayBuffer())
    proofName = `proof_${bid}_${crypto.randomBytes(8).toString("hex")}.${ext}`
  }

  const now = new Date().toISOString()

  const { data: existing } = await supabase
    .from("businesses")
    .select("upgrade_proof")
    .eq("id", bid)
    .single()

  if (existing?.upgrade_proof) {
    deleteProofFile(existing.upgrade_proof)
  }

  if (proofName && proofData) {
    ensureUploadsDir()
    const safeName = path.basename(proofName)
    fs.writeFileSync(path.join(uploadsDir, safeName), proofData)
  }

  const { error } = await supabase
    .from("businesses")
    .update({
      upgrade_requested: 1,
      upgrade_note: JSON.stringify({ ref: txRef, note }),
      upgrade_proof: proofName,
      upgrade_requested_at: now,
    })
    .eq("id", bid)

  if (error) {
    if (proofName) deleteProofFile(proofName)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase.from("audit_log").insert({
    business_id: bid,
    user_id: session.user_id,
    username: session.username,
    action: "upgrade",
    table_name: "businesses",
    record_id: bid,
    details: `Upgrade requested ref=${txRef}${proofName ? " with proof" : ""}`,
  })

  return NextResponse.json({ ok: true })
}