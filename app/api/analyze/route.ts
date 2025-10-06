import { type NextRequest, NextResponse } from "next/server"

const API_URL = "https://twitter-api-1-cv0c.onrender.com"

export async function POST(request: NextRequest) {
  try {
    const { tweet } = await request.json()

    if (!tweet || typeof tweet !== "string") {
      return NextResponse.json({ error: "Tweet text is required" }, { status: 400 })
    }

    console.log(`[v0] Analyzing tweet: "${tweet.substring(0, 50)}..."`)

    const response = await fetch(`${API_URL}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tweet }),
    })

    console.log(`[v0] Response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[v0] API error: ${errorText}`)
      return NextResponse.json(
        {
          error: "Failed to analyze tweet",
          details: errorText,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log(`[v0] Success! Data received:`, data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error in analyze route:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze tweet. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
