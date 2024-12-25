"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChapterOutline } from "@/components/chapter-outline"
import { ScrollArea } from "@/components/ui/scroll-area"
import { generateStoryOutline, generateChapterContent, saveStory, exportAllChaptersAsZip } from "@/app/actions"
import { Loader2, AlertCircle, Download } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Chapter {
  title: string
  content: string
}

export function StoryComposer() {
  const [prompt, setPrompt] = useState("")
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    setChapters([])
    try {
      const outline = await generateStoryOutline(prompt)
      const chaptersWithContent = await Promise.all(
        outline.map(async (chapter) => ({
          title: chapter.title,
          content: await generateChapterContent(chapter.title, chapter.content)
        }))
      )
      setChapters(chaptersWithContent)
      await saveStory({ title: "My Story", chapters: chaptersWithContent })
    } catch (error) {
      console.error("Failed to generate story:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportZip = async () => {
    try {
      const zipContent = await exportAllChaptersAsZip()
      const blob = new Blob([zipContent], { type: 'application/zip' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'story_chapters.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting chapters:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Textarea
          placeholder="Describe your story idea... (e.g., 'I want a short story about a man who goes fishing')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="flex space-x-2">
          <Button 
            onClick={handleSubmit} 
            disabled={!prompt || isLoading}
            className="flex-grow"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Story...
              </>
            ) : (
              "Generate Story"
            )}
          </Button>
          {chapters.length > 0 && (
            <Button onClick={handleExportZip} disabled={isLoading}>
              <Download className="mr-2 h-4 w-4" />
              Export All
            </Button>
          )}
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {chapters.length > 0 && (
        <ScrollArea className="h-[500px] rounded-md border p-4">
          {chapters.map((chapter, index) => (
            <ChapterOutline
              key={index}
              chapterNumber={index + 1}
              title={chapter.title}
              summary={chapter.content.substring(0, 150) + "..."}
            />
          ))}
        </ScrollArea>
      )}
    </div>
  )
}

