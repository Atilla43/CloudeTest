import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/niches - Get user's saved niches
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    const niches = await prisma.niche.findMany({
      where: {
        userId: session.user.id,
        ...(status && { status: status as any }),
      },
      orderBy: {
        score: "desc",
      },
      take: limit,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        status: true,
        score: true,
        searchVolume: true,
        trendGrowth: true,
        competition: true,
        monetizationPotential: true,
        estimatedRevenueMin: true,
        estimatedRevenueMax: true,
        keywords: true,
        hashtags: true,
        topChannels: true,
        discoveredAt: true,
        lastAnalyzedAt: true,
      },
    });

    return NextResponse.json({ niches });
  } catch (error) {
    console.error("Get niches error:", error);
    return NextResponse.json(
      { error: "Failed to get niches" },
      { status: 500 }
    );
  }
}

// DELETE /api/niches - Delete a niche
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { nicheId } = await req.json();

    if (!nicheId) {
      return NextResponse.json(
        { error: "Niche ID is required" },
        { status: 400 }
      );
    }

    // Delete niche (cascade will delete related content)
    await prisma.niche.delete({
      where: {
        id: nicheId,
        userId: session.user.id, // Ensure user owns this niche
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete niche error:", error);
    return NextResponse.json(
      { error: "Failed to delete niche" },
      { status: 500 }
    );
  }
}
