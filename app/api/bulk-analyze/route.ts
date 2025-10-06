import { type NextRequest, NextResponse } from "next/server"

const API_URL = "https://twitter-api-1-cv0c.onrender.com"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "CSV file is required" }, { status: 400 })
    }

    console.log(`[v0] Processing CSV file: ${file.name} (${file.size} bytes)`)

    const apiFormData = new FormData()
    apiFormData.append("file", file)

    const response = await fetch(`${API_URL}/api/bulk-analyze`, {
      method: "POST",
      body: apiFormData,
    })

    console.log(`[v0] CSV Response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[v0] API error: ${errorText}`)
      return NextResponse.json(
        {
          error: "Failed to process CSV file",
          details: errorText,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log(`[v0] Success! Data received:`, data)

    // Backend returns { stats, csv } format
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error processing CSV:", error)
    return NextResponse.json(
      {
        error: "Failed to process CSV file. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
