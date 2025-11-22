/**
 * Dashboard Content Component
 * Main dashboard UI with data fetching
 */

"use client";

import { useDashboardStats } from "@/lib/hooks";
import { useDashboardStore } from "@/lib/stores";
import { formatDuration } from "@/lib/utils";
import { useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FolderKanban,
  LineChart,
  FileText,
  Key,
  Settings,
  HelpCircle,
  LogOut,
  ArrowUpRight,
  Clock,
  Activity,
} from "lucide-react";

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
    <div
      className="flex min-h-screen"
      style={{ background: "var(--background)" }}
    >
      {/* Sidebar */}
      <aside
        className="w-64 border-r flex flex-col"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "var(--primary)" }}
            >
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span
              className="font-bold text-xl"
              style={{ color: "var(--text-primary)" }}
            >
              CodeChrono
            </span>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4">
          <div className="mb-6">
            <p
              className="text-xs font-semibold mb-3 px-3"
              style={{ color: "var(--text-muted)" }}
            >
              MENU
            </p>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors"
              style={{
                background: "var(--primary)",
                color: "white",
              }}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link
              href="/projects"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors hover:bg-opacity-80"
              style={{ color: "var(--text-primary)" }}
            >
              <FolderKanban className="w-5 h-5" />
              <span className="font-medium">Projects</span>
            </Link>
            <Link
              href="/analytics"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors hover:bg-opacity-80"
              style={{ color: "var(--text-primary)" }}
            >
              <LineChart className="w-5 h-5" />
              <span className="font-medium">Analytics</span>
            </Link>
            <Link
              href="/reports"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors hover:bg-opacity-80"
              style={{ color: "var(--text-primary)" }}
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">Reports</span>
            </Link>
          </div>

          <div className="mb-6">
            <p
              className="text-xs font-semibold mb-3 px-3"
              style={{ color: "var(--text-muted)" }}
            >
              SETTINGS
            </p>
            <Link
              href="/api-key"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors hover:bg-opacity-80"
              style={{ color: "var(--text-primary)" }}
            >
              <Key className="w-5 h-5" />
              <span className="font-medium">API Key</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors hover:bg-opacity-80"
              style={{ color: "var(--text-primary)" }}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </Link>
          </div>

          <div>
            <p
              className="text-xs font-semibold mb-3 px-3"
              style={{ color: "var(--text-muted)" }}
            >
              SUPPORT
            </p>
            <Link
              href="/help"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors hover:bg-opacity-80"
              style={{ color: "var(--text-primary)" }}
            >
              <HelpCircle className="w-5 h-5" />
              <span className="font-medium">Help</span>
            </Link>
            <Link
              href="/api/auth/signout"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors hover:bg-opacity-80"
              style={{ color: "var(--text-primary)" }}
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header
          className="border-b p-6"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Dashboard
              </h1>
              <p style={{ color: "var(--text-muted)" }}>
                Track your coding activity and productivity
              </p>
            </div>
            {apiToken && (
              <div
                className="px-4 py-2 rounded-lg"
                style={{ background: "var(--surface-hover)" }}
              >
                <p
                  className="text-xs font-medium mb-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  API Token
                </p>
                <code
                  className="text-sm font-mono"
                  style={{ color: "var(--text-primary)" }}
                >
                  {apiToken.slice(0, 20)}...
                </code>
              </div>
            )}
          </div>
        </header>

        {/* Stats Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Time Card */}
            <div
              className="p-6 rounded-xl border"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(59, 130, 246, 0.1)" }}
                >
                  <Clock className="w-6 h-6" style={{ color: "#3b82f6" }} />
                </div>
              </div>
              <h3
                className="text-3xl font-bold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {formatDuration(stats.totalTime)}
              </h3>
              <p
                className="text-sm flex items-center gap-1"
                style={{ color: "var(--text-muted)" }}
              >
                Total Coding Time
              </p>
            </div>

            {/* Total Projects Card */}
            <div
              className="p-6 rounded-xl border"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(168, 85, 247, 0.1)" }}
                >
                  <FolderKanban
                    className="w-6 h-6"
                    style={{ color: "#a855f7" }}
                  />
                </div>
              </div>
              <h3
                className="text-3xl font-bold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {totalProjects}
              </h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Total Projects
              </p>
            </div>

            {/* Active Projects Card */}
            <div
              className="p-6 rounded-xl border"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(34, 197, 94, 0.1)" }}
                >
                  <Activity className="w-6 h-6" style={{ color: "#22c55e" }} />
                </div>
              </div>
              <h3
                className="text-3xl font-bold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {activeProjects}
              </h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Active Projects
              </p>
            </div>

            {/* Top Language Card */}
            <div
              className="p-6 rounded-xl border"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(249, 115, 22, 0.1)" }}
                >
                  <ArrowUpRight
                    className="w-6 h-6"
                    style={{ color: "#f97316" }}
                  />
                </div>
              </div>
              <h3
                className="text-3xl font-bold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {topLanguage}
              </h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Top Language
              </p>
            </div>
          </div>

          {/* Projects and Languages Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Projects */}
            <div
              className="rounded-xl border"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="p-6 border-b"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex items-center justify-between">
                  <h2
                    className="text-xl font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Top Projects
                  </h2>
                  <Link
                    href="/projects"
                    className="text-sm font-medium"
                    style={{ color: "var(--primary)" }}
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
                      <div className="flex-1">
                        <Link
                          href={`/projects/${project.id}`}
                          className="font-medium hover:underline"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {project.name}
                        </Link>
                        <p
                          className="text-sm truncate"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {project.path}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p
                          className="font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {formatDuration(project.totalDuration)}
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {project.activityCount} activities
                        </p>
                      </div>
                    </div>
                  ))}
                  {stats.projects.length === 0 && (
                    <p
                      className="text-center py-8"
                      style={{ color: "var(--text-muted)" }}
                    >
                      No projects yet. Start coding to see your stats!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Top Languages */}
            <div
              className="rounded-xl border"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="p-6 border-b"
                style={{ borderColor: "var(--border)" }}
              >
                <h2
                  className="text-xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Languages
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {stats.languages.slice(0, 5).map((lang) => (
                    <div key={lang.language}>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {lang.language}
                        </span>
                        <span style={{ color: "var(--text-muted)" }}>
                          {formatDuration(lang.duration)} (
                          {lang.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div
                        className="w-full rounded-full h-2"
                        style={{ background: "var(--surface-hover)" }}
                      >
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${lang.percentage}%`,
                            background: "var(--primary)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {stats.languages.length === 0 && (
                    <p
                      className="text-center py-8"
                      style={{ color: "var(--text-muted)" }}
                    >
                      No language data yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
