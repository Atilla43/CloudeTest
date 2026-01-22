"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Copy, Check, Edit, Save } from "lucide-react";

interface ScriptViewerProps {
  contentIdea: {
    id: string;
    title: string;
    script?: string;
  };
  onClose: () => void;
  onSave?: (script: string) => void;
}

export function ScriptViewer({ contentIdea, onClose, onSave }: ScriptViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedScript, setEditedScript] = useState(contentIdea.script || "");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (contentIdea.script) {
      await navigator.clipboard.writeText(contentIdea.script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = () => {
    onSave?.(editedScript);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle>{contentIdea.title}</CardTitle>
              <CardDescription className="mt-1">Video Script</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2 mt-4">
            {!isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Script
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-6">
          {isEditing ? (
            <textarea
              value={editedScript}
              onChange={(e) => setEditedScript(e.target.value)}
              className="w-full min-h-[500px] p-4 border rounded-md font-mono text-sm"
              placeholder="Edit your script here..."
            />
          ) : (
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                {contentIdea.script || "No script generated yet."}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
