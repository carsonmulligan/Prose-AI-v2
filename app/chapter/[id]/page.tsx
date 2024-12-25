import { ChapterEditor } from "@/components/chapter-editor"
import { getStory } from "@/app/actions"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default async function ChapterPage({ params }: { params: { id: string } }) {
  const chapterNumber = parseInt(params.id, 10)
  const story = await getStory()

  if (!story || !story.chapters[chapterNumber - 1]) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Chapter Not Found</h1>
        <p>There is no story data available for this chapter.</p>
        <Link href="/" passHref>
          <Button className="mt-4">
            Go back to Story Composer
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <ChapterEditor 
        chapterNumber={chapterNumber} 
        initialChapter={story.chapters[chapterNumber - 1]} 
      />
    </div>
  )
}

