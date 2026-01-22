"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NicheCard } from "@/components/niches/niche-card";
import { Search, Loader2, TrendingUp, Sparkles } from "lucide-react";

export default function NichesPage() {
  const [keyword, setKeyword] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [savedNiches, setSavedNiches] = useState<any[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);
  const [error, setError] = useState("");

  // Load saved niches on mount
  useEffect(() => {
    loadSavedNiches();
  }, []);

  const loadSavedNiches = async () => {
    try {
      const response = await fetch("/api/niches");
      if (response.ok) {
        const data = await response.json();
        setSavedNiches(data.niches || []);
      }
    } catch (error) {
      console.error("Failed to load saved niches:", error);
    } finally {
      setIsLoadingSaved(false);
    }
  };

  const handleAnalyze = async () => {
    if (!keyword.trim()) {
      setError("Please enter a keyword");
      return;
    }

    setError("");
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await fetch("/api/niches/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim(), saveToDb: false }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Analysis failed");
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveNiche = async () => {
    if (!analysisResult) return;

    try {
      const response = await fetch("/api/niches/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: analysisResult.keyword,
          saveToDb: true,
        }),
      });

      if (response.ok) {
        // Reload saved niches
        await loadSavedNiches();
        alert("Niche saved successfully!");
      }
    } catch (error) {
      console.error("Failed to save niche:", error);
      alert("Failed to save niche");
    }
  };

  const trendingKeywords = [
    "AI productivity tools",
    "Home automation DIY",
    "Sustainable living",
    "Digital nomad lifestyle",
    "Side hustle ideas",
    "Mindfulness meditation",
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-8 h-8 text-blue-600" />
          Niche Analysis
        </h1>
        <p className="text-gray-600 mt-2">
          Discover profitable niches with AI-powered analysis
        </p>
      </div>

      {/* Search Section */}
      <Card className="border-2 border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Analyze a New Niche
          </CardTitle>
          <CardDescription>
            Enter a keyword or topic to analyze its potential
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="e.g., AI productivity tools, sustainable living..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                disabled={isAnalyzing}
                className="text-base"
              />
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !keyword.trim()}
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          {/* Trending Keywords */}
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Try these trending keywords:</p>
            <div className="flex flex-wrap gap-2">
              {trendingKeywords.map((kw) => (
                <button
                  key={kw}
                  onClick={() => setKeyword(kw)}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                  disabled={isAnalyzing}
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Result */}
      {analysisResult && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Analysis Result</h2>
            <Button onClick={handleSaveNiche} variant="outline">
              Save to My Niches
            </Button>
          </div>
          <NicheCard
            niche={analysisResult}
            onSelect={() => {
              // TODO: Navigate to detail page
            }}
          />

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Target Audience */}
            {analysisResult.targetAudience && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Target Audience</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{analysisResult.targetAudience}</p>
                </CardContent>
              </Card>
            )}

            {/* Content Strategy */}
            {analysisResult.contentStrategy && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Content Strategy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{analysisResult.contentStrategy}</p>
                </CardContent>
              </Card>
            )}

            {/* Success Factors */}
            {analysisResult.successFactors && analysisResult.successFactors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Success Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysisResult.successFactors.map((factor: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span className="text-gray-700">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Challenges */}
            {analysisResult.challenges && analysisResult.challenges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Challenges</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysisResult.challenges.map((challenge: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">⚠</span>
                        <span className="text-gray-700">{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* YouTube Data */}
          {analysisResult.youtubeData && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>YouTube Market Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Videos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analysisResult.youtubeData.totalResults.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Avg Views</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analysisResult.youtubeData.avgViews.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Max Views</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analysisResult.youtubeData.maxViews.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Engagement</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analysisResult.youtubeData.avgEngagement}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Saved Niches */}
      <div>
        <h2 className="text-2xl font-bold mb-4">My Saved Niches</h2>
        {isLoadingSaved ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className="text-gray-500 mt-2">Loading saved niches...</p>
          </div>
        ) : savedNiches.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No saved niches yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Analyze keywords above to discover profitable niches
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedNiches.map((niche) => (
              <NicheCard
                key={niche.id}
                niche={{
                  id: niche.id,
                  keyword: niche.name,
                  score: niche.score,
                  description: niche.description,
                  competition: niche.competition,
                  trendGrowth: niche.trendGrowth,
                  estimatedRevenueMin: niche.estimatedRevenueMin,
                  estimatedRevenueMax: niche.estimatedRevenueMax,
                  keyTopics: niche.keywords?.slice(1, 5),
                  searchVolume: niche.searchVolume,
                }}
                onSelect={() => {
                  // TODO: Navigate to detail page
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
