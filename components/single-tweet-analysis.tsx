"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface AnalysisResult {
  predictedClass: string
  confidence: number
  wordScores: Array<{ word: string; tfidf: number; coefficient: number }>
}

export function SingleTweetAnalysis() {
  const [tweet, setTweet] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyzeTweet = async () => {
    if (!tweet.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tweet }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("[v0] API Error:", data)
        throw new Error(data.error || "Failed to analyze tweet")
      }

      const analysisResult: AnalysisResult = {
        predictedClass: data.predicted_class || data.predictedClass || data.class || "unknown",
        confidence: data.confidence || data.score || 0,
        wordScores: data.word_scores || data.wordScores || data.words || [],
      }

      console.log("[v0] Analysis result:", analysisResult)
      setResult(analysisResult)
    } catch (err) {
      console.error("[v0] Error analyzing tweet:", err)
      setError(
        err instanceof Error ? err.message : "Failed to analyze tweet. Please check if the backend API is running.",
      )
    } finally {
      setLoading(false)
    }
  }

  const getClassColor = (className: string) => {
    switch (className) {
      case "hate speech":
        return "destructive"
      case "offensive language":
        return "default"
      case "neither":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getClassIcon = (className: string) => {
    switch (className) {
      case "hate speech":
        return <AlertCircle className="h-5 w-5" />
      case "offensive language":
        return <AlertTriangle className="h-5 w-5" />
      case "neither":
        return <CheckCircle2 className="h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Enter Tweet</CardTitle>
          <CardDescription>
            Type or paste a tweet to analyze its content for hate speech or offensive language
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter a tweet to analyze..."
            value={tweet}
            onChange={(e) => setTweet(e.target.value)}
            className="min-h-[200px] resize-none"
          />
          <Button onClick={analyzeTweet} disabled={!tweet.trim() || loading} className="w-full gap-2" size="lg">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Analyze Tweet
              </>
            )}
          </Button>
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="space-y-6">
        {result ? (
          <>
            {/* Prediction Result */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Classification Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getClassIcon(result.predictedClass)}
                    <div>
                      <p className="text-sm text-muted-foreground">Predicted Class</p>
                      <Badge variant={getClassColor(result.predictedClass)} className="mt-1 capitalize">
                        {result.predictedClass}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Confidence</p>
                    <p className="text-2xl font-bold">{result.confidence.toFixed(1)}%</p>
                  </div>
                </div>
                <Progress value={result.confidence} className="h-2" />
              </CardContent>
            </Card>

            {/* Word Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Word-Level Analysis</CardTitle>
                <CardDescription>TF-IDF scores and model coefficients for key words</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.wordScores.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-medium">{item.word}</span>
                        <div className="flex gap-4 text-xs">
                          <span className="text-muted-foreground">
                            TF-IDF:{" "}
                            <span className="font-mono font-semibold text-foreground">{item.tfidf.toFixed(4)}</span>
                          </span>
                          <span className="text-muted-foreground">
                            Coef:{" "}
                            <span
                              className={`font-mono font-semibold ${item.coefficient > 0 ? "text-destructive" : "text-green-500"}`}
                            >
                              {item.coefficient > 0 ? "+" : ""}
                              {item.coefficient.toFixed(4)}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Progress value={item.tfidf * 100} className="h-1.5" />
                        </div>
                        <div className="flex-1">
                          <Progress value={Math.abs(item.coefficient) * 25} className="h-1.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold">Interpretation:</span> Positive coefficients increase likelihood of
                    hate speech/offensive content. Higher TF-IDF scores indicate more important words in the
                    classification.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="lg:h-full flex items-center justify-center">
            <CardContent className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Send className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Enter a tweet and click analyze to see results</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
