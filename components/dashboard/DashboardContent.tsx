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

export function DashboardContent() {
  const { data: stats, isLoading, error, refetch } = useDashboardStats();
  const { setStats } = useDashboardStore();

  useEffect(() => {
    if (stats) {
      setStats(stats);
    }
  }, [stats, setStats]);

  // Calculate last 7 days stats
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const last7DaysActivity =
    stats?.dailyActivity?.filter((activity) => {
      const activityDate = new Date(activity.date);
      return activityDate >= sevenDaysAgo;
    }) || [];

  const last7DaysTime = last7DaysActivity.reduce(
    (acc, activity) => acc + activity.duration,
    0
  );

  // Prepare chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i)); // Start from 6 days ago to today
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const chartData = last7Days.map((date) => {
    // Convert date to ISO string format (YYYY-MM-DD) to match API data
    // Use local date string to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    const activity = stats?.dailyActivity?.find((a) => {
      // Extract date part from activity.date (which is already in YYYY-MM-DD format)
      const activityDateStr =
        typeof a.date === "string"
          ? a.date.split("T")[0]
          : new Date(a.date).toISOString().split("T")[0];
      return activityDateStr === dateStr;
    });
    return {
      date: date,
      duration: activity ? activity.duration : 0,
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
    };
  });

  const maxDuration = Math.max(...chartData.map((d) => d.duration), 1);

  // Debug logging
  if (typeof window !== "undefined") {
    const last7DaysLocal = last7Days.map((d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    });

    console.log("Dashboard Activity Debug:", {
      todayDate: new Date().toISOString().split("T")[0],
      todayDateLocal: (() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      })(),
      dailyActivityFromAPI: stats?.dailyActivity,
      dailyActivityDetails: stats?.dailyActivity?.map((a) => ({
        date: a.date,
        duration: a.duration,
        dateType: typeof a.date,
      })),
      chartData: chartData,
      chartDataWithDurations: chartData.map((c) => ({
        label: c.label,
        dateStr: (() => {
          const year = c.date.getFullYear();
          const month = String(c.date.getMonth() + 1).padStart(2, "0");
          const day = String(c.date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        })(),
        duration: c.duration,
      })),
      last7DaysRange: last7DaysLocal,
      hasStatsData: !!stats,
      hasDailyActivity: !!stats?.dailyActivity,
      dailyActivityLength: stats?.dailyActivity?.length || 0,
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load dashboard</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
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
        <p className="text-muted-foreground">No data available</p>
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
            Overview of your coding activity for the last 7 days
          </p>
        </div>
        {/* Removed View Analytics button as requested */}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Last 7 Days Time Card */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-500/10">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-2">
            {formatDuration(last7DaysTime)}
          </h3>
          <p className="text-sm text-muted-foreground">Last 7 Days</p>
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

      {/* Activity Chart */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-bold mb-6">Activity (Last 7 Days)</h3>
        <div className="flex items-end justify-between h-64 gap-2">
          {chartData.map((item, index) => {
            // Better scaling: ensure minimum height when there's data
            const hasData = chartData.some((d) => d.duration > 0);
            const heightPercentage = hasData
              ? Math.max(
                  (item.duration / maxDuration) * 100,
                  item.duration > 0 ? 8 : 0
                )
              : 0;

            // Check if this is today
            const isToday = index === 6; // Last day in the array is today

            return (
              <div
                key={index}
                className="flex flex-col items-center gap-2 flex-1 group h-full"
              >
                <div className="relative w-full flex justify-center h-full items-end">
                  {/* Live Indicator for Today */}
                  {isToday && item.duration > 0 && (
                    <div className="absolute -top-3 flex justify-center z-20">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                      </span>
                    </div>
                  )}
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-popover text-popover-foreground text-xs rounded px-2 py-1 whitespace-nowrap shadow-md z-10 border border-border">
                    {formatDuration(item.duration)}
                    {isToday && " (Live)"}
                  </div>
                  {/* Bar */}
                  <div
                    className="w-full max-w-[60px] bg-primary hover:opacity-80 rounded-t-md transition-all duration-500 ease-out"
                    style={{
                      height: `${heightPercentage}%`,
                    }}
                  ></div>
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  {item.label}
                </span>
              </div>
            );
          })}
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
                  className="flex items-center justify-between bg-muted"
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
                  <div className="w-full rounded-full h-2 bg-muted overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-primary transition-all duration-500"
                      style={{
                        width: `${Math.max(lang.percentage, 0.5)}%`,
                        minWidth: lang.percentage > 0 ? "2px" : "0",
                      }}
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
