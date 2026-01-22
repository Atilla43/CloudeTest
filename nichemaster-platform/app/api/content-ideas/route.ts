import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const contentIdeaSchema = z.object({
  title: z.string().min(1, "Title is required"),
  nicheId: z.string().min(1, "Niche ID is required"),
  description: z.string().optional(),
  format: z.enum(["SHORT", "MEDIUM", "LONG"]).default("SHORT"),
  keywords: z.array(z.string()).optional(),
  hashtags: z.array(z.string()).optional(),
});

// GET /api/content-ideas - Get user's content ideas
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const nicheId = searchParams.get("nicheId");
    const status = searchParams.get("status");
    const format = searchParams.get("format");
    const limit = parseInt(searchParams.get("limit") || "100");

    const contentIdeas = await prisma.contentIdea.findMany({
      where: {
        userId: session.user.id,
        ...(nicheId && { nicheId }),
        ...(status && { status: status as any }),
        ...(format && { format: format as any }),
      },
      include: {
        niche: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json({ contentIdeas });
  } catch (error) {
    console.error("Get content ideas error:", error);
    return NextResponse.json(
      { error: "Failed to get content ideas" },
      { status: 500 }
    );
  }
}

// POST /api/content-ideas - Create new content idea
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = contentIdeaSchema.parse(body);

    // Verify niche belongs to user
    const niche = await prisma.niche.findFirst({
      where: {
        id: validatedData.nicheId,
        userId: session.user.id,
      },
    });

    if (!niche) {
      return NextResponse.json(
        { error: "Niche not found or unauthorized" },
        { status: 404 }
      );
    }

    const contentIdea = await prisma.contentIdea.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        format: validatedData.format,
        keywords: validatedData.keywords || [],
        hashtags: validatedData.hashtags || [],
        userId: session.user.id,
        nicheId: validatedData.nicheId,
        status: "DRAFT",
      },
      include: {
        niche: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });

    return NextResponse.json({ contentIdea }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Create content idea error:", error);
    return NextResponse.json(
      { error: "Failed to create content idea" },
      { status: 500 }
    );
  }
}

// PATCH /api/content-ideas - Update content idea
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, script, status, scheduledFor, ...updates } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Content idea ID is required" },
        { status: 400 }
      );
    }

    const contentIdea = await prisma.contentIdea.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        ...updates,
        ...(script !== undefined && { script }),
        ...(status && { status }),
        ...(scheduledFor && { scheduledFor: new Date(scheduledFor) }),
      },
      include: {
        niche: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });

    return NextResponse.json({ contentIdea });
  } catch (error) {
    console.error("Update content idea error:", error);
    return NextResponse.json(
      { error: "Failed to update content idea" },
      { status: 500 }
    );
  }
}

// DELETE /api/content-ideas - Delete content idea
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Content idea ID is required" },
        { status: 400 }
      );
    }

    await prisma.contentIdea.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete content idea error:", error);
    return NextResponse.json(
      { error: "Failed to delete content idea" },
      { status: 500 }
    );
  }
}
