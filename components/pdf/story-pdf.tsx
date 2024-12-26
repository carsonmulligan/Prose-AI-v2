import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

interface Story {
  title: string
  chapters: {
    title: string
    content: string
  }[]
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  chapterTitle: {
    fontSize: 18,
    marginBottom: 10,
    marginTop: 20,
  },
  paragraph: {
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 10,
    textAlign: 'justify',
  },
})

export function createStoryPDF(story: Story) {
  return (
    <Document>
      {story.chapters.map((chapter, index) => (
        <Page key={index} size="A4" style={styles.page}>
          <View>
            <Text style={styles.chapterTitle}>
              Chapter {index + 1}: {chapter.title}
            </Text>
            {chapter.content.split('\n').map((paragraph, pIndex) => (
              <Text key={pIndex} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}
          </View>
        </Page>
      ))}
    </Document>
  )
} 