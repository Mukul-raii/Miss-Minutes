import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import {
  GitCommit,
  Calendar,
  Code,
  FileCode,
  Activity,
  ExternalLink,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProjectDetailClient } from "@/components/projects/ProjectDetailClient";
import Link from "next/link";

function formatDuration(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  const { id } = await params;

  // @ts-expect-error - session user id
  const userId = session?.user?.id;

  // Fetch API token
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { apiToken: true },
  });

  const apiToken = user?.apiToken || "";

  // Fetch project with all related data
  const project = await prisma.project.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      activities: {
        orderBy: { timestamp: "desc" },
        take: 1000,
      },
      commits: {
        orderBy: { timestamp: "desc" },
        take: 50,
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Calculate statistics
  const totalDuration = project.activities.reduce(
    (sum: number, a) => sum + a.duration,
    0
  );

  // Language breakdown
  const languageMap = new Map<string, number>();
  project.activities.forEach((activity) => {
    const current = languageMap.get(activity.language) || 0;
    languageMap.set(activity.language, current + activity.duration);
  });
  const languages = Array.from(languageMap.entries())
    .map(([language, duration]) => ({ language, duration }))
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 5); // Show only top 5 languages

  // Editor breakdown
  const editorMap = new Map<string, number>();
  project.activities.forEach((activity) => {
    const editor = activity.editor || "vscode";
    const current = editorMap.get(editor) || 0;
    editorMap.set(editor, current + activity.duration);
  });
  const editors = Array.from(editorMap.entries()).map(([editor, duration]) => ({
    editor,
    duration,
  }));

  // File time breakdown (top 10)
  const fileMap = new Map<string, number>();
  project.activities.forEach((activity) => {
    const current = fileMap.get(activity.filePath) || 0;
    fileMap.set(activity.filePath, current + activity.duration);
  });
  const topFiles = Array.from(fileMap.entries())
    .map(([filePath, duration]) => ({ filePath, duration }))
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10);

  // Daily activity for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i)); // Start from 6 days ago to today
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const dailyActivity = last7Days.map((date) => {
    const dayActivities = project.activities.filter((activity) => {
      const activityDate = new Date(Number(activity.timestamp));
      activityDate.setHours(0, 0, 0, 0);
      return activityDate.getTime() === date.getTime();
    });

    const duration = dayActivities.reduce((sum, a) => sum + a.duration, 0);

    return {
      date: date.toLocaleDateString("en-US", { weekday: "short" }),
      duration: duration,
      fullDate: date,
    };
  });

  // Calculate today's total time for display
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayActivity = dailyActivity.find((d) => {
    const actDate = new Date(d.fullDate);
    actDate.setHours(0, 0, 0, 0);
    return actDate.getTime() === today.getTime();
  });
  const todayTimeSpent = todayActivity?.duration || 0;

  // Commit statistics
  const totalCommits = project.commits.length;
  const commitDurations = new Map<string, number>();
  project.activities.forEach((activity) => {
    if (activity.commitId) {
      const current = commitDurations.get(activity.commitId) || 0;
      commitDurations.set(activity.commitId, current + activity.duration);
    }
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              {project.name.charAt(0).toUpperCase() +
                project.name.slice(1).toLowerCase()}
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {project.path}
            </p>
          </div>

          {/* View in Showcase Button */}
          <Link
            href={`/showcase?project=${project.id}&theme=gradient`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all hover:scale-105 hover:shadow-lg"
            style={{
              background: "var(--primary)",
              borderColor: "var(--primary)",
              color: "white",
            }}
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm font-medium">View in Showcase</span>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {/* Today's Activity - Real-time */}
          {/* <div className="p-6 rounded-xl border border-border bg-linear-to-br from-primary/5 to-primary/10 shadow-sm relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <Activity
                className="w-5 h-5"
                style={{ color: "var(--primary)" }}
              />
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                Today&apos;s Activity
              </span>
            </div>
            <p
              className="text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {formatDuration(todayTimeSpent)}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Live •{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div> */}

          <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Calendar
                className="w-5 h-5"
                style={{ color: "var(--primary)" }}
              />
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                Total Time
              </span>
            </div>
            <p
              className="text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {formatDuration(totalDuration)}
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <GitCommit
                className="w-5 h-5"
                style={{ color: "var(--primary)" }}
              />
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                Commits
              </span>
            </div>
            <p
              className="text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {totalCommits}
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Code className="w-5 h-5" style={{ color: "var(--primary)" }} />
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                Languages
              </span>
            </div>
            <p
              className="text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {languages.length}
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <FileCode
                className="w-5 h-5"
                style={{ color: "var(--primary)" }}
              />
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                Files Edited
              </span>
            </div>
            <p
              className="text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {fileMap.size}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Daily Time Graph */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
            <h2
              className="text-lg font-semibold mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              Daily Activity (Last 7 Days)
            </h2>
            <div className="flex items-end justify-around h-48 gap-2">
              {dailyActivity.map((day, index) => {
                const maxDuration = Math.max(
                  ...dailyActivity.map((d) => d.duration),
                  1 // Ensure at least 1 to avoid division by zero
                );
                const hasData = dailyActivity.some((d) => d.duration > 0);
                const heightPercentage = hasData
                  ? Math.max(
                      (day.duration / maxDuration) * 100,
                      day.duration > 0 ? 8 : 0
                    )
                  : 0;

                // Check if this is today
                const isToday = index === 6; // Last day in the array is today

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-2 flex-1 h-full"
                  >
                    <div className="relative w-full flex justify-center items-end h-full">
                      {isToday && day.duration > 0 && (
                        <div className="absolute -top-3 flex justify-center z-10">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                          </span>
                        </div>
                      )}
                      <div
                        className="w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                        style={{
                          height: `${heightPercentage}%`,
                          background: "var(--primary)",
                          maxWidth: "60px",
                        }}
                        title={`${day.date}: ${formatDuration(day.duration)}${
                          isToday ? " (Live)" : ""
                        }`}
                      />
                    </div>
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {day.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Language Split Pie */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
            <h2
              className="text-lg font-semibold mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              Language Distribution
            </h2>
            <div className="space-y-4">
              {languages.length === 0 ? (
                <p
                  className="text-center py-8"
                  style={{ color: "var(--text-muted)" }}
                >
                  No language data
                </p>
              ) : (
                languages.map((lang) => {
                  const percentage =
                    totalDuration > 0
                      ? Math.round((lang.duration / totalDuration) * 100)
                      : 0;

                  return (
                    <div key={lang.language}>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {lang.language}
                        </span>
                        <span
                          className="text-sm"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {percentage}% • {formatDuration(lang.duration)}
                        </span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden bg-muted">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            background: "var(--primary)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          {/* Editor Usage - Compact Layout */}
          {/*   <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
              <h2
                className="text-lg font-semibold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Editor Usage
              </h2>
              <div className="space-y-3">
                {editors.length === 0 ? (
                  <p
                    className="text-center py-4 text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    No editor data
                  </p>
                ) : (
                  editors.map((editor) => {
                    const editorPercentage =
                      totalDuration > 0
                        ? (editor.duration / totalDuration) * 100
                        : 0;

                    return (
                      <div key={editor.editor} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span
                            className="font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {editor.editor}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {formatDuration(editor.duration)} (
                            {editorPercentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden bg-muted">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${editorPercentage}%`,
                              background: "var(--primary)",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div> */}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Top Files */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
            <h2
              className="text-lg font-semibold mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              Top Files by Time
            </h2>
            <div className="space-y-3">
              {topFiles.map((file, index) => (
                <div
                  key={file.filePath}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted"
                >
                  <span
                    className="text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "var(--primary)", color: "white" }}
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {file.filePath.split("/").pop()}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {file.filePath}
                    </p>
                  </div>
                  <span
                    className="text-sm font-medium shrink-0"
                    style={{ color: "var(--primary)" }}
                  >
                    {formatDuration(file.duration)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div></div>
        </div>

        {/* Client Component for Commits with Pagination and Showcase */}
        <ProjectDetailClient
          commits={project.commits.map((c) => ({
            ...c,
            timestamp: c.timestamp,
          }))}
          projectId={project.id}
          projectData={{
            name: project.name,
            description: `${project.path}`,
            timeSpent: formatDuration(totalDuration),
            commits: totalCommits,
            languages: languages.map((l) => ({
              name: l.language,
              percentage:
                totalDuration > 0
                  ? Math.round((l.duration / totalDuration) * 100)
                  : 0,
            })),
            trend: dailyActivity.map((d) => d.duration),
          }}
          apiToken={apiToken}
        />
      </div>
    </div>
  );
}
