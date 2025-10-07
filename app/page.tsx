"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, MessageSquare, AlertCircle, CheckCircle2, AlertTriangle, ImageIcon } from "lucide-react"
import { SingleTweetAnalysis } from "@/components/single-tweet-analysis"
import { BulkAnalysis } from "@/components/bulk-analysis"
import { MemeAnalysis } from "@/components/meme-analysis"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"single" | "bulk" | "meme">("single")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">NLP Hate Speech Detection</h1>
                <p className="text-sm text-muted-foreground">AI-powered tweet behavior analysis</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs font-mono">
              Logistic Regression Model
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 p-1 bg-muted rounded-lg w-fit">
          <Button
            variant={activeTab === "single" ? "default" : "ghost"}
            onClick={() => setActiveTab("single")}
            className="gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Single Tweet Analysis
          </Button>
          <Button
            variant={activeTab === "bulk" ? "default" : "ghost"}
            onClick={() => setActiveTab("bulk")}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Bulk CSV Processing
          </Button>
          <Button
            variant={activeTab === "meme" ? "default" : "ghost"}
            onClick={() => setActiveTab("meme")}
            className="gap-2"
          >
            <ImageIcon className="h-4 w-4" />
            Meme Analysis
          </Button>
        </div>

        {/* Content */}
        {activeTab === "single" ? <SingleTweetAnalysis /> : activeTab === "bulk" ? <BulkAnalysis /> : <MemeAnalysis />}

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-sm">Hate Speech</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Content that attacks or uses discriminatory language against individuals or groups
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-500/20 bg-orange-500/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-sm">Offensive Language</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Profanity or vulgar language that may be inappropriate but not targeted hate
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-500/20 bg-green-500/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <CardTitle className="text-sm">Neither</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Normal content without hate speech or offensive language</p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Powered by Logistic Regression with TF-IDF Vectorization</p>
        </div>
      </footer>
    </div>
  )
}
