"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Tag, Trash2 } from "lucide-react";

interface ContentCardProps {
  content: {
    id: string;
    title: string;
    description?: string;
    format: "SHORT" | "MEDIUM" | "LONG";
    status: string;
    script?: string;
    niche?: {
      id: string;
      name: string;
      category: string;
    };
    createdAt: string;
    scheduledFor?: string;
    keywords?: string[];
    hashtags?: string[];
  };
  onViewScript?: () => void;
  onGenerateScript?: () => void;
  onDelete?: () => void;
}

export function ContentCard({
  content,
  onViewScript,
  onGenerateScript,
  onDelete,
}: ContentCardProps) {
  const getFormatBadge = (format: string) => {
    const colors = {
      SHORT: "bg-green-100 text-green-700",
      MEDIUM: "bg-blue-100 text-blue-700",
      LONG: "bg-purple-100 text-purple-700",
    };
    const labels = {
      SHORT: "Short (30-60s)",
      MEDIUM: "Medium (10-15min)",
      LONG: "Long (15-30min)",
    };
    return { color: colors[format as keyof typeof colors], label: labels[format as keyof typeof labels] };
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      DRAFT: "bg-gray-100 text-gray-700",
      SCRIPT_GENERATED: "bg-yellow-100 text-yellow-700",
      APPROVED: "bg-green-100 text-green-700",
      IN_PRODUCTION: "bg-blue-100 text-blue-700",
      COMPLETED: "bg-indigo-100 text-indigo-700",
      PUBLISHED: "bg-purple-100 text-purple-700",
      REJECTED: "bg-red-100 text-red-700",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const formatBadge = getFormatBadge(content.format);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 line-clamp-2">
              {content.title}
            </CardTitle>
            {content.niche && (
              <p className="text-sm text-gray-500">
                Niche: {content.niche.name}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {content.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {content.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`text-xs px-2 py-1 rounded ${formatBadge.color}`}>
            {formatBadge.label}
          </span>
          <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(content.status)}`}>
            {content.status.replace(/_/g, " ")}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>
              Created: {new Date(content.createdAt).toLocaleDateString()}
            </span>
          </div>
          {content.scheduledFor && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>
                Scheduled: {new Date(content.scheduledFor).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {content.hashtags && content.hashtags.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">Hashtags:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {content.hashtags.slice(0, 5).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {content.script ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewScript}
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-1" />
              View Script
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onGenerateScript}
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-1" />
              Generate Script
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
