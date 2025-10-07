import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { generateText } from "ai"

// Note: AI Gateway supports Google Vertex/Gemini by default in Next.js.
// We request a structured JSON output to make parsing robust.
const SYSTEM_INSTRUCTIONS = `
You are a safety classifier for image memes. 
Classify the meme into exactly ONE of these labels:
- "hate meme"
- "not hate meme"
- "normal meme"
- "fair meme"

Return strict JSON with keys:
{
  "label": "hate meme" | "not hate meme" | "normal meme" | "fair meme",
  "reason": "short, precise explanation referencing visual/text cues"
}
Do not include any extra text before or after the JSON.
`

export async function POST(req: NextRequest) {
  try {
    const HAS_GEMINI_KEY = Boolean(process.env.GEMINI_API_KEY)
    console.log("[v0] meme-analyze: request received. has GEMINI_API_KEY:", HAS_GEMINI_KEY)

    const form = await req.formData()
    const image = form.get("image") as File | null

    if (!image) {
      return NextResponse.json({ error: "Image is required as 'image' form-data field" }, { status: 400 })
    }

    console.log("[v0] meme-analyze: image info", {
      type: image.type,
      size: (image as any).size ?? "unknown",
    })

    const bytes = new Uint8Array(await image.arrayBuffer())

    // Build prompt asking for JSON and pass the image to the model.
    const { text } = await generateText({
      model: "google/gemini-1.5-flash",
      prompt: `${SYSTEM_INSTRUCTIONS}\nAnalyze the attached image and produce the JSON.`,
      // Pass image bytes to the model (supported by AI SDK with Vertex/Gemini)
      images: [{ data: bytes, mimeType: image.type || "image/png" }],
      temperature: 0.2,
    })
    console.log("[v0] meme-analyze: model responded with text length", text?.length ?? 0)

    // Try to parse strict JSON response
    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      // Fallback: extract JSON block if model included extra text
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) throw new Error("Model returned non-JSON response")
      parsed = JSON.parse(match[0])
    }

    // Validate label
    const valid = ["hate meme", "not hate meme", "normal meme", "fair meme"]
    if (!parsed?.label || !valid.includes(parsed.label)) {
      return NextResponse.json({ error: "Invalid model response", raw: parsed }, { status: 502 })
    }

    return NextResponse.json({
      label: parsed.label,
      reason: parsed.reason || "No reason provided by the model.",
    })
  } catch (err) {
    console.error("[v0] Meme analysis error:", err)
    return NextResponse.json(
      {
        error: "Failed to analyze meme image",
        details: err instanceof Error ? err.message : "Unknown error",
        hint: "Ensure the Vercel AI Gateway is configured for Google Gemini or add GEMINI_API_KEY in Project Settings (server-only).",
      },
      { status: 500 },
    )
  }
}
