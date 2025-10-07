"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, ImageIcon, Loader2, CheckCircle2, AlertTriangle, Shield } from "lucide-react"

type MemeLabel = "hate meme" | "not hate meme" | "normal meme" | "fair meme"

interface MemeResult {
  label: MemeLabel
  reason: string
}

export function MemeAnalysis() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<MemeResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResult(null)
    setError(null)
    setProgress(0)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(f))
  }

  const analyze = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)
    setProgress(0)

    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 8, 85))
    }, 250)

    try {
      const form = new FormData()
      form.append("image", file)

      const res = await fetch("/api/meme-analyze", {
        method: "POST",
        body: form,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || "Failed to analyze meme")
      }

      const data = (await res.json()) as MemeResult
      setResult(data)
    } catch (e) {
      console.error("[v0] Meme analyze error:", e)
      setError(
        e instanceof Error ? e.message : "Failed to analyze image. Please try again with a different image format.",
      )
    } finally {
      setLoading(false)
    }
  }

  const labelStyle = (label: MemeLabel) => {
    switch (label) {
      case "hate meme":
        return { variant: "destructive" as const, icon: <Shield className="h-4 w-4" /> }
      case "not hate meme":
        return { variant: "secondary" as const, icon: <CheckCircle2 className="h-4 w-4" /> }
      case "normal meme":
        return { variant: "default" as const, icon: <ImageIcon className="h-4 w-4" /> }
      case "fair meme":
        return { variant: "outline" as const, icon: <AlertTriangle className="h-4 w-4" /> }
      default:
        return { variant: "secondary" as const, icon: null }
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Meme Analysis (Gemini)</CardTitle>
          <CardDescription>
            Upload an image meme. The model will classify it as hate meme, not hate meme, normal meme, or fair meme with
            a short explanation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Uploader */}
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            {!file ? (
              <div className="space-y-3">
                <div className="h-16 w-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-medium">Upload meme image</p>
                <p className="text-sm text-muted-foreground">PNG, JPG, JPEG or GIF</p>
                <Button onClick={() => fileInputRef.current?.click()}>Select Image</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {previewUrl && (
                  <div className="mx-auto max-w-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl || "/placeholder.svg"}
                      alt="Meme preview"
                      className="w-full rounded-lg border border-border object-contain"
                    />
                  </div>
                )}
                <div className="flex items-center justify-center gap-2">
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    Change Image
                  </Button>
                  <Button onClick={analyze} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Analyze Meme"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {loading && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Running Gemini analysis...</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {error}
            </div>
          )}

          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant={labelStyle(result.label).variant as any} className="capitalize gap-2">
                    {labelStyle(result.label).icon}
                    {result.label}
                  </Badge>
                </div>
                <div className="text-sm leading-relaxed text-muted-foreground">
                  <span className="font-medium text-foreground">Reason:</span> {result.reason}
                </div>
                <div className="text-xs text-muted-foreground">
                  We use Google Gemini via the Vercel AI Gateway. You don&apos;t need to provide an API key. If you want
                  to use your own key, add it as a server environment variable named{" "}
                  <span className="font-mono">GEMINI_API_KEY</span> in Project Settings and tell me to wire it up.
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
