/**
 * Dashboard Content Component
 * Main dashboard UI with data fetching
 */

"use client";

import { useDashboardStats } from "@/lib/hooks";
import { useDashboardStore } from "@/lib/stores";
import { formatDuration } from "@/lib/utils/index";
import { useEffect } from "react";
import Link from "next/link";
import { FolderKanban, ArrowUpRight, Clock, Activity } from "lucide-react";

export function DashboardContent({ apiToken }: { apiToken?: string }) {
  const { data: stats, isLoading, error, refetch } = useDashboardStats();
  const { setStats } = useDashboardStore();

  useEffect(() => {
    if (stats) {
      setStats(stats);
    }
  }, [stats, setStats]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load dashboard</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const totalProjects = stats.totalProjects;
  const activeProjects = stats.activeProjects;
  const topLanguage = stats.languages[0]?.language || "N/A";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track your coding activity and productivity
          </p>
        </div>
        {apiToken && (
          <div className="px-4 py-2 rounded-lg bg-muted">
            <p className="text-xs font-medium mb-1 text-muted-foreground">
              API Token
            </p>
            <code className="text-sm font-mono">
              {apiToken.slice(0, 20)}...
            </code>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Time Card */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-500/10">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-2">
            {formatDuration(stats.totalTime)}
          </h3>
          <p className="text-sm text-muted-foreground">Total Coding Time</p>
        </div>

        {/* Total Projects Card */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-500/10">
              <FolderKanban className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-2">{totalProjects}</h3>
          <p className="text-sm text-muted-foreground">Total Projects</p>
        </div>

        {/* Active Projects Card */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-500/10">
              <Activity className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-2">{activeProjects}</h3>
          <p className="text-sm text-muted-foreground">Active Projects</p>
        </div>

        {/* Top Language Card */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-500/10">
              <ArrowUpRight className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-2">{topLanguage}</h3>
          <p className="text-sm text-muted-foreground">Top Language</p>
        </div>
      </div>

      {/* Projects and Languages Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Projects */}
        <div className="rounded-lg border bg-card">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Top Projects</h2>
              <Link
                href="/projects"
                className="text-sm font-medium text-primary hover:underline"
              >
                View All →
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.projects.slice(0, 5).map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/projects/${project.id}`}
                      className="font-medium hover:underline"
                    >
                      {project.name}
                    </Link>
                    <p className="text-sm text-muted-foreground truncate">
                      {project.path}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-medium">
                      {formatDuration(project.totalDuration)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {project.activityCount} activities
                    </p>
                  </div>
                </div>
              ))}
              {stats.projects.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">
                  No projects yet. Start coding to see your stats!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Top Languages */}
        <div className="rounded-lg border bg-card">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Languages</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.languages.slice(0, 5).map((lang) => (
                <div key={lang.language}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{lang.language}</span>
                    <span className="text-muted-foreground text-sm">
                      {formatDuration(lang.duration)} (
                      {lang.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full rounded-full h-2 bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${lang.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
              {stats.languages.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">
                  No language data yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
