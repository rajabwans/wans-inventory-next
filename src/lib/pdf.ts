import PDFDocument from "pdfkit"

export interface PdfColumn {
  label: string
  align?: "left" | "right" | "center"
  width?: number
}

const PAGE_WIDTH = 595.28 // A4 points
const MARGIN = 40
const AVAILABLE = PAGE_WIDTH - MARGIN * 2

export function generatePDF(draw: (doc: PDFKit.PDFDocument) => void): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: MARGIN })
    const chunks: Buffer[] = []
    doc.on("data", (c: Buffer) => chunks.push(c))
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)
    try {
      draw(doc)
      doc.end()
    } catch (e) {
      reject(e)
    }
  })
}

export function headerTable(doc: PDFKit.PDFDocument, company: string, docType: string, dateStr: string) {
  doc
    .fillColor("#1f2937")
    .fontSize(18)
    .font("Helvetica-Bold")
    .text(company.toUpperCase(), { align: "center" })
  doc
    .fillColor("#6b7280")
    .fontSize(11)
    .font("Helvetica")
    .text(`${docType}${dateStr ? `  |  ${dateStr}` : ""}`, { align: "center" })
  doc.moveDown(1.2)
}

export function sectionHead(doc: PDFKit.PDFDocument, text: string) {
  doc.moveDown(0.4)
  doc
    .fillColor("#111827")
    .fontSize(12)
    .font("Helvetica-Bold")
    .text(text)
  doc.moveDown(0.4)
}

export function infoRows(doc: PDFKit.PDFDocument, rows: [string, string][]) {
  doc.fontSize(10)
  for (const [k, v] of rows) {
    doc.fillColor("#6b7280").font("Helvetica-Bold").text(`${k}:  `, { continued: true, width: 140 })
    doc.fillColor("#111827").font("Helvetica").text(v, { width: AVAILABLE })
  }
  doc.moveDown(0.6)
}

export function dataTable(doc: PDFKit.PDFDocument, columns: PdfColumn[], rows: (string | number)[][], totals?: (string | number)[]) {
  const widths = columns.map((c) => c.width || Math.floor(AVAILABLE / columns.length))
  const totalW = widths.reduce((a, b) => a + b, 0)
  const startX = MARGIN + (AVAILABLE - totalW) / 2
  const headerH = 22
  const rowH = 18

  const y0 = doc.y

  doc.save().fillColor("#343a40").rect(startX, y0, totalW, headerH).fill()
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(9)
  let cx = startX
  columns.forEach((c, i) => {
    doc.text(c.label, cx + 4, y0 + 6, { width: widths[i] - 8, align: c.align || "left" })
    cx += widths[i]
  })

  doc.restore()
  let y = y0 + headerH
  doc.font("Helvetica").fontSize(9)
  rows.forEach((r, ri) => {
    if (ri % 2 === 1) {
      doc.save().fillColor("#f8f9fa").rect(startX, y, totalW, rowH).fill().restore()
    }
    cx = startX
    columns.forEach((c, i) => {
      doc.fillColor("#111827").text(String(r[i] ?? ""), cx + 4, y + 5, { width: widths[i] - 8, align: c.align || "left" })
      cx += widths[i]
    })
    y += rowH
    if (y > doc.page.height - 70) {
      doc.addPage()
      y = doc.y
    }
  })

  if (totals) {
    doc.save().fillColor("#e9ecef").rect(startX, y, totalW, rowH).fill().restore()
    cx = startX
    columns.forEach((c, i) => {
      doc.fillColor("#111827").font("Helvetica-Bold").text(String(totals[i] ?? ""), cx + 4, y + 5, { width: widths[i] - 8, align: c.align || "left" })
      cx += widths[i]
    })
    y += rowH
  }

  doc.y = y + 6
}

export function footerLine(doc: PDFKit.PDFDocument, company: string) {
  doc.moveDown(1.5)
  doc
    .fillColor("#9ca3af")
    .font("Helvetica")
    .fontSize(9)
    .text(`${company} — Thank you for your business.`, { align: "center" })
}

export function fmt(n: number, currency = "UGX") {
  return `${currency} ${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
}