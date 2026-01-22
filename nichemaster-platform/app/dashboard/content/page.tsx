"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContentIdeaForm } from "@/components/content/content-idea-form";
import { ContentCard } from "@/components/content/content-card";
import { ScriptViewer } from "@/components/content/script-viewer";
import { Clapperboard, Loader2, Sparkles, Filter } from "lucide-react";

export default function ContentPage() {
  const [contentIdeas, setContentIdeas] = useState<any[]>([]);
  const [niches, setNiches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [showScriptViewer, setShowScriptViewer] = useState(false);

  // Filters
  const [filterNiche, setFilterNiche] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFormat, setFilterFormat] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load content ideas and niches in parallel
      const [contentRes, nichesRes] = await Promise.all([
        fetch("/api/content-ideas"),
        fetch("/api/niches"),
      ]);

      if (contentRes.ok) {
        const data = await contentRes.json();
        setContentIdeas(data.contentIdeas || []);
      }

      if (nichesRes.ok) {
        const data = await nichesRes.json();
        setNiches(data.niches || []);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateIdeas = async () => {
    if (niches.length === 0) {
      alert("Please create a niche first");
      return;
    }

    const nicheId = niches[0].id; // Use first niche for now
    setIsGenerating(true);

    try {
      const response = await fetch("/api/content-ideas/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nicheId,
          count: 10,
          format: "SHORT",
          autoSave: true,
        }),
      });

      if (response.ok) {
        await loadData(); // Reload content ideas
        alert("10 content ideas generated successfully!");
      }
    } catch (error) {
      console.error("Failed to generate ideas:", error);
      alert("Failed to generate ideas");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateScript = async (content: any) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/content-ideas/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: content.title,
          format: content.format,
          niche: content.niche?.name,
          description: content.description,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Update content idea with script
        await fetch("/api/content-ideas", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: content.id,
            script: data.script,
            status: "SCRIPT_GENERATED",
          }),
        });

        await loadData(); // Reload to get updated data
      }
    } catch (error) {
      console.error("Failed to generate script:", error);
      alert("Failed to generate script");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewScript = (content: any) => {
    setSelectedContent(content);
    setShowScriptViewer(true);
  };

  const handleSaveScript = async (script: string) => {
    if (!selectedContent) return;

    try {
      await fetch("/api/content-ideas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedContent.id,
          script,
        }),
      });

      await loadData();
      setShowScriptViewer(false);
    } catch (error) {
      console.error("Failed to save script:", error);
      alert("Failed to save script");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this content idea?")) return;

    try {
      await fetch("/api/content-ideas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      await loadData();
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Failed to delete content idea");
    }
  };

  // Filter content ideas
  const filteredContent = contentIdeas.filter((content) => {
    if (filterNiche && content.nicheId !== filterNiche) return false;
    if (filterStatus && content.status !== filterStatus) return false;
    if (filterFormat && content.format !== filterFormat) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Clapperboard className="w-8 h-8 text-blue-600" />
          Content Factory
        </h1>
        <p className="text-gray-600 mt-2">
          Create and manage video content ideas
        </p>
      </div>

      {/* Quick Actions */}
      <Card className="border-2 border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            AI Content Generator
          </CardTitle>
          <CardDescription>
            Generate multiple content ideas automatically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGenerateIdeas}
            disabled={isGenerating || niches.length === 0}
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate 10 Content Ideas
              </>
            )}
          </Button>
          {niches.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Please create a niche first to generate content ideas
            </p>
          )}
        </CardContent>
      </Card>

      {/* Create Form */}
      <ContentIdeaForm onSuccess={loadData} />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Niche</label>
              <select
                value={filterNiche}
                onChange={(e) => setFilterNiche(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All Niches</option>
                {niches.map((niche) => (
                  <option key={niche.id} value={niche.id}>
                    {niche.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="SCRIPT_GENERATED">Script Generated</option>
                <option value="APPROVED">Approved</option>
                <option value="IN_PRODUCTION">In Production</option>
                <option value="COMPLETED">Completed</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block">Format</label>
              <select
                value={filterFormat}
                onChange={(e) => setFilterFormat(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All Formats</option>
                <option value="SHORT">Short (30-60s)</option>
                <option value="MEDIUM">Medium (10-15min)</option>
                <option value="LONG">Long (15-30min)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Ideas List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          My Content Ideas ({filteredContent.length})
        </h2>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className="text-gray-500 mt-2">Loading content ideas...</p>
          </div>
        ) : filteredContent.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clapperboard className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No content ideas yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Create your first content idea above or generate ideas automatically
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                onViewScript={() => handleViewScript(content)}
                onGenerateScript={() => handleGenerateScript(content)}
                onDelete={() => handleDelete(content.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Script Viewer Modal */}
      {showScriptViewer && selectedContent && (
        <ScriptViewer
          contentIdea={selectedContent}
          onClose={() => setShowScriptViewer(false)}
          onSave={handleSaveScript}
        />
      )}
    </div>
  );
}
