import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface ChapterOutlineProps {
  chapterNumber: number
  title: string
  summary: string
  onEdit: () => void
}

export function ChapterOutline({ chapterNumber, title, summary, onEdit }: ChapterOutlineProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Chapter {chapterNumber}: {title}</CardTitle>
        <div className="space-x-2">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Link href={`/chapter/${chapterNumber}`} passHref>
            <Button variant="ghost" size="sm">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{summary}</p>
      </CardContent>
    </Card>
  )
}

