"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function DashboardNavbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                NicheMaster Pro
              </span>
            </Link>

            <div className="hidden md:flex gap-6">
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/niches"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                📊 Niches
              </Link>
              <Link
                href="/dashboard/content"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                🎬 Content
              </Link>
              <Link
                href="/dashboard/analytics"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                📈 Analytics
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {session?.user?.email}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
