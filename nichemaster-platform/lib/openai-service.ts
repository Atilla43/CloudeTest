import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface NicheAnalysis {
  score: number; // 0-10
  searchVolume: number;
  trendGrowth: number;
  competition: "LOW" | "MEDIUM" | "HIGH";
  monetizationPotential: number; // 0-10
  estimatedRevenueMin: number;
  estimatedRevenueMax: number;
  description: string;
  recommendedFormats: string[];
  keyTopics: string[];
  targetAudience: string;
  contentStrategy: string;
  successFactors: string[];
  challenges: string[];
}

/**
 * Analyze niche using GPT-4o
 */
export async function analyzeNicheWithAI(
  keyword: string,
  youtubeData?: any
): Promise<NicheAnalysis> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const prompt = `Analyze the following content niche for YouTube/TikTok/Instagram: "${keyword}"

${
  youtubeData
    ? `
YouTube Data:
- Total videos found: ${youtubeData.totalResults}
- Average views: ${Math.round(youtubeData.avgViews)}
- Max views: ${Math.round(youtubeData.maxViews)}
- Average engagement rate: ${youtubeData.avgEngagement.toFixed(2)}%
- Top channels: ${youtubeData.topChannels.map((c: any) => c.channelTitle).join(", ")}
`
    : ""
}

Provide a detailed analysis in JSON format with the following structure:
{
  "score": number (0-10, overall niche score),
  "searchVolume": number (estimated monthly searches),
  "trendGrowth": number (percentage growth, e.g., 50 for 50%),
  "competition": "LOW" | "MEDIUM" | "HIGH",
  "monetizationPotential": number (0-10),
  "estimatedRevenueMin": number (monthly USD),
  "estimatedRevenueMax": number (monthly USD),
  "description": "Brief description of the niche",
  "recommendedFormats": ["format1", "format2"],
  "keyTopics": ["topic1", "topic2", "topic3"],
  "targetAudience": "Description of target audience",
  "contentStrategy": "Recommended content strategy",
  "successFactors": ["factor1", "factor2"],
  "challenges": ["challenge1", "challenge2"]
}

Consider:
- Current market trends for 2026
- Competition level based on data
- Monetization potential (ads, sponsorships, products)
- Audience engagement potential
- Content creation difficulty
- Sustainability of the niche

Return ONLY valid JSON, no additional text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert content strategist and niche analyst. Analyze niches for content creators focusing on profitability, growth potential, and market trends.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(
      completion.choices[0].message.content || "{}"
    );

    return {
      score: analysis.score || 5,
      searchVolume: analysis.searchVolume || 0,
      trendGrowth: analysis.trendGrowth || 0,
      competition: analysis.competition || "MEDIUM",
      monetizationPotential: analysis.monetizationPotential || 5,
      estimatedRevenueMin: analysis.estimatedRevenueMin || 300,
      estimatedRevenueMax: analysis.estimatedRevenueMax || 1000,
      description: analysis.description || "No description available",
      recommendedFormats: analysis.recommendedFormats || ["SHORT", "MEDIUM"],
      keyTopics: analysis.keyTopics || [],
      targetAudience: analysis.targetAudience || "General audience",
      contentStrategy: analysis.contentStrategy || "Create engaging content",
      successFactors: analysis.successFactors || [],
      challenges: analysis.challenges || [],
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to analyze niche with AI");
  }
}

/**
 * Generate content ideas for a niche
 */
export async function generateContentIdeas(
  nicheName: string,
  count: number = 10
): Promise<string[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const prompt = `Generate ${count} engaging video content ideas for the niche: "${nicheName}"

Each idea should be:
- Catchy and clickable
- Suitable for YouTube Shorts, TikTok, or Instagram Reels
- Focused on value delivery or entertainment
- Optimized for viral potential

Return as a JSON array of strings: ["idea1", "idea2", ...]`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a creative content strategist specializing in viral video ideas.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.9,
      response_format: { type: "json_object" },
    });

    const response = JSON.parse(
      completion.choices[0].message.content || '{"ideas": []}'
    );
    return response.ideas || [];
  } catch (error) {
    console.error("OpenAI API error:", error);
    return [];
  }
}
