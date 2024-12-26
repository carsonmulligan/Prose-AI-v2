"use server"

import fs from 'fs/promises'
import path from 'path'
import JSZip from 'jszip'
import { renderToBuffer } from '@react-pdf/renderer'
import { createStoryPDF } from '@/components/pdf/story-pdf'

interface Chapter {
  title: string
  content: string
}

interface Story {
  title: string
  chapters: Chapter[]
}

export async function generateStoryOutline(prompt: string): Promise<Chapter[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not set")
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a creative writing assistant. Generate a story outline based on the given prompt. The outline should consist of 4-5 chapters, each with a title and a brief summary." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error response:", errorData);
      throw new Error(`OpenAI API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("OpenAI API response:", JSON.stringify(data, null, 2));

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content generated from OpenAI API");
    }

    // Parse the content into chapters
    const chapters: Chapter[] = content.split(/Chapter \d+:/).filter(Boolean).map(chapterString => {
      const [title, ...contentParts] = chapterString.split('\n').filter(Boolean);
      return {
        title: title.trim(),
        content: contentParts.join('\n').trim()
      };
    });

    if (chapters.length === 0) {
      throw new Error("Failed to parse chapters from the generated content");
    }

    return chapters;
  } catch (error) {
    console.error("Error generating story outline:", error);
    throw error instanceof Error ? error : new Error("An unknown error occurred");
  }
}

export async function generateChapterContent(chapterTitle: string, chapterSummary: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not set")
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a creative writing assistant. Generate a detailed chapter based on the given title and summary." },
          { role: "user", content: `Write a detailed chapter for the following:\nTitle: ${chapterTitle}\nSummary: ${chapterSummary}` }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error response:", errorData);
      throw new Error(`OpenAI API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("OpenAI API response:", JSON.stringify(data, null, 2));

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content generated from OpenAI API");
    }

    return content;
  } catch (error) {
    console.error("Error generating chapter content:", error);
    throw error;
  }
}

export async function saveStory(story: Story): Promise<void> {
  const dirPath = path.join(process.cwd(), 'app', 'data');
  const filePath = path.join(dirPath, 'story.json');
  
  try {
    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(story, null, 2));
  } catch (error) {
    console.error("Error saving story file:", error);
    throw new Error("Failed to save story");
  }
}

export async function getStory(): Promise<Story | null> {
  const filePath = path.join(process.cwd(), 'app', 'data', 'story.json');
  try {
    await fs.access(filePath);
  } catch (error) {
    // File doesn't exist, create an empty story
    const emptyStory: Story = { title: "", chapters: [] };
    await saveStory(emptyStory);
    return emptyStory;
  }

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading story file:", error);
    return null;
  }
}

export async function updateChapter(chapterIndex: number, updatedChapter: Chapter): Promise<void> {
  const story = await getStory();
  if (!story) {
    throw new Error("Story not found");
  }
  story.chapters[chapterIndex] = updatedChapter;
  await saveStory(story);
}

export async function exportChapterAsMarkdown(chapterIndex: number): Promise<string> {
  const story = await getStory();
  if (!story || !story.chapters[chapterIndex]) {
    throw new Error("Chapter not found");
  }

  const chapter = story.chapters[chapterIndex];
  const markdown = `# ${chapter.title}\n\n${chapter.content}`;

  return markdown;
}

export async function exportAllChaptersAsZip(): Promise<Uint8Array> {
  const story = await getStory();
  if (!story) {
    throw new Error("Story not found");
  }

  const zip = new JSZip();

  story.chapters.forEach((chapter, index) => {
    const markdown = `# ${chapter.title}\n\n${chapter.content}`;
    zip.file(`chapter_${index + 1}.md`, markdown);
  });

  const zipContent = await zip.generateAsync({ type: "uint8array" });
  return zipContent;
}

export async function exportAllChaptersAsPDF(): Promise<Buffer> {
  const story = await getStory();
  if (!story) {
    throw new Error("Story not found");
  }

  try {
    const buffer = await renderToBuffer(createStoryPDF(story));
    return buffer;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}

