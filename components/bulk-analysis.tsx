"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Download, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function BulkAnalysis() {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{ total: number; hateSpeech: number; offensive: number; neither: number } | null>(
    null,
  )
  const [resultData, setResultData] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setCompleted(false)
      setStats(null)
      setError(null)
      setResultData(null)
    }
  }

  const processCSV = async () => {
    if (!file) return

    setProcessing(true)
    setProgress(0)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      // Simulate progress while waiting for API
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 300)

      const response = await fetch("/api/bulk-analyze", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process CSV")
      }

      const data = await response.json()
      console.log("[v0] Bulk analysis response:", data)

      // Backend returns { stats: { total, hateSpeech, offensive, neither }, csv: "csv_string" }
      setResultData(data.csv)
      setStats(data.stats)
      setCompleted(true)
    } catch (err) {
      console.error("[v0] Error processing CSV:", err)
      setError(
        err instanceof Error ? err.message : "Failed to process CSV. Please check the file format and try again.",
      )
    } finally {
      setProcessing(false)
    }
  }

  const downloadResults = () => {
    if (!resultData) return

    const blob = new Blob([resultData], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "analyzed_tweets.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Bulk CSV Processing</CardTitle>
          <CardDescription>
            Upload a CSV file with tweets to analyze multiple entries at once. Your CSV should have a column named
            "tweets".
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Section */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />

            {!file ? (
              <div className="space-y-4">
                <div className="h-16 w-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium mb-1">Upload CSV File</p>
                  <p className="text-sm text-muted-foreground">Click to browse or drag and drop your file here</p>
                </div>
                <Button onClick={() => fileInputRef.current?.click()}>Select File</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium mb-1">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                    Change File
                  </Button>
                  <Button onClick={processCSV} disabled={processing}>
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Process CSV"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <Card className="bg-destructive/5 border-destructive/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                  <div>
                    <p className="font-semibold text-destructive">Error Processing File</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Processing Progress */}
          {processing && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Processing tweets...</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {completed && stats && (
            <div className="space-y-4">
              <Card className="bg-green-500/5 border-green-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="font-semibold">Processing Complete</p>
                      <p className="text-sm text-muted-foreground">Analyzed {stats.total} tweets successfully</p>
                    </div>
                  </div>
                  <Button onClick={downloadResults} className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    Download Results CSV
                  </Button>
                </CardContent>
              </Card>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="border-destructive/20 bg-destructive/5">
                  <CardContent className="pt-6 text-center">
                    <p className="text-3xl font-bold text-destructive">{stats.hateSpeech}</p>
                    <p className="text-sm text-muted-foreground mt-1">Hate Speech</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((stats.hateSpeech / stats.total) * 100).toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-orange-500/20 bg-orange-500/5">
                  <CardContent className="pt-6 text-center">
                    <p className="text-3xl font-bold text-orange-500">{stats.offensive}</p>
                    <p className="text-sm text-muted-foreground mt-1">Offensive</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((stats.offensive / stats.total) * 100).toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-green-500/20 bg-green-500/5">
                  <CardContent className="pt-6 text-center">
                    <p className="text-3xl font-bold text-green-500">{stats.neither}</p>
                    <p className="text-sm text-muted-foreground mt-1">Neither</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((stats.neither / stats.total) * 100).toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Instructions */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-sm">CSV Format Requirements</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                • Your CSV file must contain a column named{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-xs">tweets</code>
              </p>
              <p>• Each row should contain one tweet to analyze</p>
              <p>
                • The output CSV will include the original tweets plus a{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-xs">predicted_behavior</code> column
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
