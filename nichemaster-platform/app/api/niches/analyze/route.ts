import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { analyzeNicheFromYouTube } from "@/lib/youtube";
import { analyzeNicheWithAI } from "@/lib/openai-service";
import { prisma } from "@/lib/prisma";
import { cache } from "@/lib/redis";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { keyword, saveToDb } = await req.json();

    if (!keyword || typeof keyword !== "string") {
      return NextResponse.json(
        { error: "Keyword is required" },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `niche:analysis:${keyword.toLowerCase()}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({
        ...cached,
        fromCache: true,
      });
    }

    // Analyze with YouTube Data API
    let youtubeData = null;
    try {
      youtubeData = await analyzeNicheFromYouTube(keyword);
    } catch (error) {
      console.error("YouTube analysis error:", error);
      // Continue without YouTube data
    }

    // Analyze with AI
    const aiAnalysis = await analyzeNicheWithAI(keyword, youtubeData);

    // Extract keywords and hashtags
    const keywords = [
      keyword,
      ...aiAnalysis.keyTopics.slice(0, 5),
    ];
    const hashtags = aiAnalysis.keyTopics
      .slice(0, 8)
      .map((topic) => `#${topic.replace(/\s+/g, "")}`);

    const result = {
      keyword,
      score: aiAnalysis.score,
      searchVolume: aiAnalysis.searchVolume,
      trendGrowth: aiAnalysis.trendGrowth,
      competition: aiAnalysis.competition,
      monetizationPotential: aiAnalysis.monetizationPotential,
      estimatedRevenueMin: aiAnalysis.estimatedRevenueMin,
      estimatedRevenueMax: aiAnalysis.estimatedRevenueMax,
      description: aiAnalysis.description,
      recommendedFormats: aiAnalysis.recommendedFormats,
      keyTopics: aiAnalysis.keyTopics,
      targetAudience: aiAnalysis.targetAudience,
      contentStrategy: aiAnalysis.contentStrategy,
      successFactors: aiAnalysis.successFactors,
      challenges: aiAnalysis.challenges,
      keywords,
      hashtags,
      youtubeData: youtubeData
        ? {
            totalVideos: youtubeData.totalVideos,
            totalResults: youtubeData.totalResults,
            avgViews: Math.round(youtubeData.avgViews),
            maxViews: Math.round(youtubeData.maxViews),
            avgEngagement: youtubeData.avgEngagement.toFixed(2),
            topChannels: youtubeData.topChannels,
            topVideos: youtubeData.topVideos.slice(0, 5),
          }
        : null,
    };

    // Cache for 24 hours
    await cache.set(cacheKey, result, 86400);

    // Save to database if requested
    if (saveToDb) {
      try {
        await prisma.niche.create({
          data: {
            name: keyword,
            description: aiAnalysis.description,
            category: aiAnalysis.keyTopics[0] || "General",
            status: "DISCOVERED",
            score: aiAnalysis.score,
            searchVolume: aiAnalysis.searchVolume,
            trendGrowth: aiAnalysis.trendGrowth,
            competition: aiAnalysis.competition,
            monetizationPotential: aiAnalysis.monetizationPotential,
            estimatedRevenueMin: aiAnalysis.estimatedRevenueMin,
            estimatedRevenueMax: aiAnalysis.estimatedRevenueMax,
            keywords,
            hashtags,
            topChannels: youtubeData?.topChannels || [],
            trendData: JSON.parse(JSON.stringify({
              youtubeMetrics: youtubeData,
              aiAnalysis: {
                targetAudience: aiAnalysis.targetAudience,
                contentStrategy: aiAnalysis.contentStrategy,
                successFactors: aiAnalysis.successFactors,
                challenges: aiAnalysis.challenges,
              },
            })),
            userId: session.user.id,
          },
        });
      } catch (dbError) {
        console.error("Database save error:", dbError);
        // Continue even if DB save fails
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Niche analysis error:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze niche",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
