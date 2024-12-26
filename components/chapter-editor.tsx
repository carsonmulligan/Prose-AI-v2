"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Save, ArrowLeft, Loader2, Download } from 'lucide-react'
import { updateChapter, generateChapterContent, exportChapterAsMarkdown, exportAllChaptersAsPDF } from "@/app/actions"
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Chapter {
  title: string
  content: string
}

interface ChapterEditorProps {
  chapterNumber: number
  initialChapter: Chapter
}

export function ChapterEditor({ chapterNumber, initialChapter }: ChapterEditorProps) {
  const [chapter, setChapter] = useState<Chapter>(initialChapter)
  const [isLoading, setIsLoading] = useState(false)
  const [prompt, setPrompt] = useState("")

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateChapter(chapterNumber - 1, chapter)
    } catch (error) {
      console.error("Error saving chapter:", error)
    }
    setIsLoading(false)
  }

  const handleGenerateContent = async () => {
    setIsLoading(true)
    try {
      const newContent = await generateChapterContent(chapter.title, prompt)
      setChapter({ ...chapter, content: newContent })
    } catch (error) {
      console.error("Error generating chapter content:", error)
    }
    setIsLoading(false)
    setPrompt("")
  }

  const handleExportMarkdown = async () => {
    try {
      const markdown = await exportChapterAsMarkdown(chapterNumber - 1)
      const blob = new Blob([markdown], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `chapter_${chapterNumber}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting chapter:", error)
    }
  }

  const handleExportPDF = async () => {
    try {
      const pdfBuffer = await exportAllChaptersAsPDF()
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `story.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting PDF:", error)
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Link href="/" passHref>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <CardTitle className="text-lg">
            <Input
              value={chapter.title}
              onChange={(e) => setChapter({ ...chapter, title: e.target.value })}
              className="text-lg font-bold"
            />
          </CardTitle>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={handleSave} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportMarkdown}>
                Export as Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={chapter.content}
          onChange={(e) => setChapter({ ...chapter, content: e.target.value })}
          className="min-h-[300px]"
        />
        <div className="flex space-x-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a prompt to generate or modify content..."
            className="flex-grow"
          />
          <Button onClick={handleGenerateContent} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

