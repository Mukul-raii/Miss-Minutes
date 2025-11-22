/**
 * Dashboard Client Component
 * Example client component using TanStack Query hooks and Zustand stores
 */

"use client";

import { useDashboardStats } from "@/lib/hooks";
import { useDashboardStore, useUIStore } from "@/lib/stores";
import { formatDuration } from "@/lib/utils/index";
import { useEffect } from "react";
import {
  TrendingUp,
  ArrowUpRight,
  Clock,
  FolderKanban,
  Activity,
} from "lucide-react";

export function DashboardClient() {
  // React Query hook for fetching data
  const { data: stats, isLoading, error, refetch } = useDashboardStats();

  // Zustand stores for global state
  const { setStats } = useDashboardStore();
  const { addNotification } = useUIStore();

  // Update store when data changes
  useEffect(() => {
    if (stats) {
      setStats(stats);
    }
  }, [stats, setStats]);

  // Handle errors
  useEffect(() => {
    if (error) {
      addNotification("error", "Failed to load dashboard statistics");
    }
  }, [error, addNotification]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">Failed to load dashboard data</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center text-gray-500">No data available</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Time Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm font-medium">Total Time</div>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {formatDuration(stats.totalTime)}
          </div>
          <div className="flex items-center mt-2 text-green-500 text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+12% from last week</span>
          </div>
        </div>

        {/* Total Projects Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm font-medium">
              Total Projects
            </div>
            <FolderKanban className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.totalProjects}
          </div>
          <div className="text-gray-500 text-sm mt-2">
            {stats.activeProjects} active
          </div>
        </div>

        {/* Active Projects Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm font-medium">
              Active Projects
            </div>
            <Activity className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.activeProjects}
          </div>
          <div className="text-gray-500 text-sm mt-2">Currently working on</div>
        </div>

        {/* Top Language Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm font-medium">
              Top Language
            </div>
            <ArrowUpRight className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.languages[0]?.language || "N/A"}
          </div>
          <div className="text-gray-500 text-sm mt-2">
            {stats.languages[0]?.percentage.toFixed(1)}% of time
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Recent Projects</h2>
        </div>
        <div className="divide-y">
          {stats.projects.slice(0, 5).map((project) => (
            <div
              key={project.id}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-500">{project.path}</p>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {formatDuration(project.totalDuration)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {project.activityCount} activities
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Languages Distribution */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Languages</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {stats.languages.slice(0, 5).map((lang) => (
              <div key={lang.language}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {lang.language}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDuration(lang.duration)} (
                    {lang.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${lang.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
