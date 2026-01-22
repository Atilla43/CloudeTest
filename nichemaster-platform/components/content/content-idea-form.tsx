"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

interface ContentIdeaFormProps {
  onSuccess?: () => void;
}

export function ContentIdeaForm({ onSuccess }: ContentIdeaFormProps) {
  const [niches, setNiches] = useState<any[]>([]);
  const [selectedNicheId, setSelectedNicheId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState<"SHORT" | "MEDIUM" | "LONG">("SHORT");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNiches, setIsLoadingNiches] = useState(true);
  const [error, setError] = useState("");

  // Load niches on mount
  useEffect(() => {
    loadNiches();
  }, []);

  const loadNiches = async () => {
    try {
      const response = await fetch("/api/niches");
      if (response.ok) {
        const data = await response.json();
        setNiches(data.niches || []);
        if (data.niches.length > 0) {
          setSelectedNicheId(data.niches[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load niches:", error);
    } finally {
      setIsLoadingNiches(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedNicheId || !title.trim()) {
      setError("Please select a niche and enter a title");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/content-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nicheId: selectedNicheId,
          title: title.trim(),
          description: description.trim(),
          format,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create content idea");
      }

      // Reset form
      setTitle("");
      setDescription("");
      setError("");

      onSuccess?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create content idea");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingNiches) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p className="text-gray-500 mt-2">Loading niches...</p>
        </CardContent>
      </Card>
    );
  }

  if (niches.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">No niches found</p>
          <p className="text-sm text-gray-400 mt-1">
            Please create a niche first in the Niches section
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          Create Content Idea
        </CardTitle>
        <CardDescription>
          Add a new video content idea for your niche
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Niche Selection */}
          <div className="space-y-2">
            <Label htmlFor="niche">Niche</Label>
            <select
              id="niche"
              value={selectedNicheId}
              onChange={(e) => setSelectedNicheId(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              disabled={isLoading}
            >
              {niches.map((niche) => (
                <option key={niche.id} value={niche.id}>
                  {niche.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Video Title</Label>
            <Input
              id="title"
              placeholder="e.g., 5 AI Tools That Will Save You 10 Hours a Week"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <textarea
              id="description"
              placeholder="Brief description of the video concept..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              disabled={isLoading}
            />
          </div>

          {/* Format */}
          <div className="space-y-2">
            <Label>Video Format</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormat("SHORT")}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  format === "SHORT"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                disabled={isLoading}
              >
                Short (30-60s)
              </button>
              <button
                type="button"
                onClick={() => setFormat("MEDIUM")}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  format === "MEDIUM"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                disabled={isLoading}
              >
                Medium (10-15min)
              </button>
              <button
                type="button"
                onClick={() => setFormat("LONG")}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  format === "LONG"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                disabled={isLoading}
              >
                Long (15-30min)
              </button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Content Idea"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
