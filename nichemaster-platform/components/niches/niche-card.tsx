"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, DollarSign, Target } from "lucide-react";

interface NicheCardProps {
  niche: {
    id?: string;
    keyword: string;
    score: number;
    description: string;
    competition: "LOW" | "MEDIUM" | "HIGH";
    trendGrowth: number;
    estimatedRevenueMin: number;
    estimatedRevenueMax: number;
    keyTopics?: string[];
    searchVolume?: number;
  };
  onSelect?: () => void;
  onSave?: () => void;
  showSaveButton?: boolean;
}

export function NicheCard({ niche, onSelect, onSave, showSaveButton = false }: NicheCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600 bg-green-50";
    if (score >= 6) return "text-blue-600 bg-blue-50";
    if (score >= 4) return "text-yellow-600 bg-yellow-50";
    return "text-gray-600 bg-gray-50";
  };

  const getCompetitionColor = (competition: string) => {
    if (competition === "LOW") return "text-green-600 bg-green-50";
    if (competition === "MEDIUM") return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onSelect}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{niche.keyword}</CardTitle>
            <CardDescription className="line-clamp-2">
              {niche.description}
            </CardDescription>
          </div>
          <div
            className={`ml-4 px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(
              niche.score
            )}`}
          >
            {niche.score.toFixed(1)}/10
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Competition</p>
              <span
                className={`text-sm font-semibold px-2 py-0.5 rounded ${getCompetitionColor(
                  niche.competition
                )}`}
              >
                {niche.competition}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Growth</p>
              <p className="text-sm font-semibold text-gray-900">
                {niche.trendGrowth > 0 ? "+" : ""}
                {niche.trendGrowth.toFixed(0)}%
              </p>
            </div>
          </div>

          {niche.searchVolume && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Search Volume</p>
                <p className="text-sm font-semibold text-gray-900">
                  {niche.searchVolume.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Est. Revenue</p>
              <p className="text-sm font-semibold text-gray-900">
                ${niche.estimatedRevenueMin}-${niche.estimatedRevenueMax}
              </p>
            </div>
          </div>
        </div>

        {niche.keyTopics && niche.keyTopics.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Key Topics:</p>
            <div className="flex flex-wrap gap-1">
              {niche.keyTopics.slice(0, 4).map((topic, index) => (
                <span
                  key={index}
                  className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {showSaveButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSave?.();
              }}
              className="flex-1"
            >
              Save Niche
            </Button>
          )}
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.();
            }}
            className="flex-1"
          >
            View Details →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
