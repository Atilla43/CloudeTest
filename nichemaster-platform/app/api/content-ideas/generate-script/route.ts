import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const { title, format, niche, description } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Generate script based on format
    const scriptLength =
      format === "SHORT"
        ? "30-60 seconds"
        : format === "MEDIUM"
        ? "10-15 minutes"
        : "15-30 minutes";

    const prompt = `Generate a detailed video script for a ${scriptLength} video with the following details:

Title: "${title}"
${niche ? `Niche: ${niche}` : ""}
${description ? `Description: ${description}` : ""}
Format: ${format === "SHORT" ? "Short-form (YouTube Shorts/TikTok/Reels)" : format === "MEDIUM" ? "Medium-form YouTube video" : "Long-form YouTube video"}

The script should include:
${
  format === "SHORT"
    ? `
1. HOOK (0-3 seconds): Attention-grabbing opening
2. PROBLEM (3-10 seconds): Present the issue or topic
3. SOLUTION (10-45 seconds): Deliver value or information
4. CTA (45-60 seconds): Call to action (subscribe, like, follow)
`
    : `
1. INTRO + HOOK (0-30 seconds): Engaging opening
2. VALUE PROPOSITION (30-60 seconds): What viewers will learn
3. MAIN CONTENT (broken into 3-5 key points with timestamps)
4. SUMMARY (1 minute): Recap key takeaways
5. CTA + OUTRO (30 seconds): Subscribe, like, comment
`
}

Format the script with clear sections, timestamps, and speaking cues.
Make it engaging, conversational, and optimized for viewer retention.
Include visual/B-roll suggestions in [brackets].

Return ONLY the script, no additional commentary.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert video script writer who creates engaging, high-retention scripts for YouTube, TikTok, and social media content.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const script = completion.choices[0].message.content || "";

    return NextResponse.json({ script });
  } catch (error) {
    console.error("Generate script error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate script",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
