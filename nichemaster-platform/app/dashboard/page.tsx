"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session?.user?.name || session?.user?.email}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your content factory today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardDescription>Active Niches</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              No niches discovered yet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Videos Created</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Start creating content
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-3xl">$0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Publish videos to earn
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="text-4xl mb-2">📊</div>
            <CardTitle>Module 1: Niche Analysis</CardTitle>
            <CardDescription>
              Discover and analyze profitable niches with AI-powered insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                YouTube Data API Integration
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Google Trends Analysis
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                AI-Powered Scoring
              </div>
              <Link href="/dashboard/niches">
                <Button className="w-full mt-4">
                  Explore Niches →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="text-4xl mb-2">🎬</div>
            <CardTitle>Module 2: Content Factory</CardTitle>
            <CardDescription>
              Automated video content generation and publishing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                AI Script Generation
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Automated Video Production
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Multi-Platform Publishing
              </div>
              <Link href="/dashboard/content">
                <Button className="w-full mt-4">
                  Create Content →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle>🚀 Getting Started</CardTitle>
          <CardDescription>
            Follow these steps to start generating content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">
                1
              </span>
              <div>
                <p className="font-medium text-gray-900">Discover a Niche</p>
                <p className="text-sm text-gray-600">
                  Use Module 1 to find profitable niches for your content
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">
                2
              </span>
              <div>
                <p className="font-medium text-gray-900">Generate Content Ideas</p>
                <p className="text-sm text-gray-600">
                  AI will create 50-100 video ideas for your niche
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">
                3
              </span>
              <div>
                <p className="font-medium text-gray-900">Produce & Publish</p>
                <p className="text-sm text-gray-600">
                  Automated video creation and publishing to multiple platforms
                </p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
