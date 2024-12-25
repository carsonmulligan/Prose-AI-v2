import { StoryComposer } from "@/components/story-composer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Prose AI</CardTitle>
          <CardDescription>Your AI writing assistant. Describe your story idea and I'll help you develop it.</CardDescription>
        </CardHeader>
        <CardContent>
          <StoryComposer />
        </CardContent>
      </Card>
    </div>
  )
}

