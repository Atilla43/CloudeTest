import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateContentIdeas } from "@/lib/openai-service";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { nicheId, count = 10, format = "SHORT", autoSave = false } = await req.json();

    if (!nicheId) {
      return NextResponse.json(
        { error: "Niche ID is required" },
        { status: 400 }
      );
    }

    // Get niche info
    const niche = await prisma.niche.findFirst({
      where: {
        id: nicheId,
        userId: session.user.id,
      },
    });

    if (!niche) {
      return NextResponse.json(
        { error: "Niche not found or unauthorized" },
        { status: 404 }
      );
    }

    // Generate content ideas using AI
    const ideas = await generateContentIdeas(niche.name, count);

    // Optionally auto-save to database
    if (autoSave && ideas.length > 0) {
      await prisma.contentIdea.createMany({
        data: ideas.map((idea) => ({
          title: idea,
          format: format as any,
          status: "DRAFT",
          keywords: niche.keywords.slice(0, 5),
          hashtags: niche.hashtags.slice(0, 8),
          userId: session.user.id,
          nicheId: niche.id,
        })),
      });
    }

    return NextResponse.json({
      ideas,
      niche: {
        id: niche.id,
        name: niche.name,
      },
      count: ideas.length,
      autoSaved: autoSave,
    });
  } catch (error) {
    console.error("Generate content ideas error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate content ideas",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
