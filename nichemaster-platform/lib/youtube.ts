import axios from "axios";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  channelId: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  subscriberCount?: number;
}

export interface YouTubeSearchResult {
  videos: YouTubeVideo[];
  totalResults: number;
}

/**
 * Search for trending videos by keyword
 */
export async function searchTrendingVideos(
  keyword: string,
  maxResults: number = 50
): Promise<YouTubeSearchResult> {
  if (!YOUTUBE_API_KEY) {
    throw new Error("YouTube API key not configured");
  }

  try {
    // Search for videos
    const searchResponse = await axios.get(`${YOUTUBE_API_BASE}/search`, {
      params: {
        key: YOUTUBE_API_KEY,
        q: keyword,
        part: "snippet",
        type: "video",
        order: "relevance",
        maxResults,
        relevanceLanguage: "en",
        regionCode: "US",
      },
    });

    const videoIds = searchResponse.data.items
      .map((item: any) => item.id.videoId)
      .join(",");

    // Get detailed statistics
    const videosResponse = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        key: YOUTUBE_API_KEY,
        id: videoIds,
        part: "statistics,snippet",
      },
    });

    const videos: YouTubeVideo[] = videosResponse.data.items.map(
      (video: any) => ({
        id: video.id,
        title: video.snippet.title,
        channelTitle: video.snippet.channelTitle,
        channelId: video.snippet.channelId,
        description: video.snippet.description,
        publishedAt: video.snippet.publishedAt,
        thumbnailUrl: video.snippet.thumbnails.medium.url,
        viewCount: parseInt(video.statistics.viewCount || "0"),
        likeCount: parseInt(video.statistics.likeCount || "0"),
        commentCount: parseInt(video.statistics.commentCount || "0"),
      })
    );

    return {
      videos,
      totalResults: searchResponse.data.pageInfo.totalResults,
    };
  } catch (error) {
    console.error("YouTube API error:", error);
    throw new Error("Failed to search YouTube videos");
  }
}

/**
 * Get channel statistics
 */
export async function getChannelStats(channelId: string) {
  if (!YOUTUBE_API_KEY) {
    throw new Error("YouTube API key not configured");
  }

  try {
    const response = await axios.get(`${YOUTUBE_API_BASE}/channels`, {
      params: {
        key: YOUTUBE_API_KEY,
        id: channelId,
        part: "statistics,snippet",
      },
    });

    const channel = response.data.items[0];
    return {
      subscriberCount: parseInt(channel.statistics.subscriberCount || "0"),
      videoCount: parseInt(channel.statistics.videoCount || "0"),
      viewCount: parseInt(channel.statistics.viewCount || "0"),
      title: channel.snippet.title,
      thumbnailUrl: channel.snippet.thumbnails.default.url,
    };
  } catch (error) {
    console.error("YouTube Channel API error:", error);
    return null;
  }
}

/**
 * Calculate engagement rate
 */
export function calculateEngagementRate(video: YouTubeVideo): number {
  if (video.viewCount === 0) return 0;
  const engagement = video.likeCount + video.commentCount;
  return (engagement / video.viewCount) * 100;
}

/**
 * Analyze niche from YouTube data
 */
export async function analyzeNicheFromYouTube(keyword: string) {
  const searchResult = await searchTrendingVideos(keyword, 50);
  const videos = searchResult.videos;

  if (videos.length === 0) {
    return null;
  }

  // Calculate metrics
  const totalViews = videos.reduce((sum, v) => sum + v.viewCount, 0);
  const avgViews = totalViews / videos.length;
  const maxViews = Math.max(...videos.map((v) => v.viewCount));
  const avgEngagement = videos.reduce(
    (sum, v) => sum + calculateEngagementRate(v),
    0
  ) / videos.length;

  // Get top channels
  const channelMap = new Map<string, number>();
  videos.forEach((video) => {
    const count = channelMap.get(video.channelId) || 0;
    channelMap.set(video.channelId, count + 1);
  });

  const topChannels = Array.from(channelMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([channelId]) => {
      const video = videos.find((v) => v.channelId === channelId);
      return {
        channelId,
        channelTitle: video?.channelTitle || "",
        videoCount: channelMap.get(channelId) || 0,
      };
    });

  return {
    keyword,
    totalVideos: videos.length,
    totalResults: searchResult.totalResults,
    avgViews,
    maxViews,
    avgEngagement,
    topChannels,
    topVideos: videos.slice(0, 10),
  };
}
