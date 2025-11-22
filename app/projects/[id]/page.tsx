import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import { GitCommit, Calendar, Code, FileCode } from "lucide-react";
import { prisma } from "@/lib/prisma";

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
    .sort((a, b) => b.duration - a.duration);

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
  const now = new Date();
  const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const dailyMap = new Map<string, number>();
  project.activities.forEach((activity) => {
    const timestamp = Number(activity.timestamp);
    if (timestamp >= sevenDaysAgo) {
      const date = new Date(timestamp).toLocaleDateString();
      const current = dailyMap.get(date) || 0;
      dailyMap.set(date, current + activity.duration);
    }
  });
  const dailyActivity = Array.from(dailyMap.entries())
    .map(([date, duration]) => ({ date, duration }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            {project.name}
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {project.path}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div
            className="p-6 rounded-xl border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
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

          <div
            className="p-6 rounded-xl border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
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

          <div
            className="p-6 rounded-xl border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
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

          <div
            className="p-6 rounded-xl border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
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
          <div
            className="p-6 rounded-xl border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <h2
              className="text-lg font-semibold mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              Daily Activity (Last 7 Days)
            </h2>
            <div className="flex items-end justify-around h-48">
              {dailyActivity.length === 0 ? (
                <p
                  className="text-center w-full"
                  style={{ color: "var(--text-muted)" }}
                >
                  No activity in the last 7 days
                </p>
              ) : (
                dailyActivity.map((day, index) => {
                  const maxDuration = Math.max(
                    ...dailyActivity.map((d) => d.duration)
                  );
                  const height =
                    maxDuration > 0 ? (day.duration / maxDuration) * 100 : 10;

                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-2 flex-1"
                    >
                      <div
                        className="w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                        style={{
                          height: `${Math.max(height, 10)}%`,
                          background: "var(--primary)",
                          maxWidth: "60px",
                        }}
                        title={`${day.date}: ${formatDuration(day.duration)}`}
                      />
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {new Date(day.date).toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Language Split Pie */}
          <div
            className="p-6 rounded-xl border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
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
                languages.map((lang, index) => {
                  const percentage =
                    totalDuration > 0
                      ? Math.round((lang.duration / totalDuration) * 100)
                      : 0;
                  const colors = [
                    "var(--primary)",
                    "var(--primary-light)",
                    "var(--accent)",
                    "var(--secondary)",
                  ];

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
                      <div
                        className="h-2 rounded-full overflow-hidden"
                        style={{ background: "var(--background)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            background: colors[index % colors.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Editor Usage */}
          <div
            className="p-6 rounded-xl border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <h2
              className="text-lg font-semibold mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              Editor Usage
            </h2>
            <div className="space-y-3">
              {editors.map((editor) => (
                <div
                  key={editor.editor}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: "var(--background)" }}
                >
                  <span
                    className="font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {editor.editor}
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {formatDuration(editor.duration)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Files */}
          <div
            className="p-6 rounded-xl border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
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
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ background: "var(--background)" }}
                >
                  <span
                    className="text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center"
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
                    className="text-sm font-medium"
                    style={{ color: "var(--primary)" }}
                  >
                    {formatDuration(file.duration)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Git Commits */}
        <div
          className="p-6 rounded-xl border"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h2
            className="text-lg font-semibold mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            Recent Git Commits (Time Tracked)
          </h2>
          <div className="space-y-3">
            {project.commits.length === 0 ? (
              <p
                className="text-center py-8"
                style={{ color: "var(--text-muted)" }}
              >
                No commits tracked yet. Make commits while the extension is
                running to track time!
              </p>
            ) : (
              project.commits.map((commit) => {
                return (
                  <div
                    key={commit.id}
                    className="p-4 rounded-lg border"
                    style={{
                      background: "var(--background)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <code
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              background: "var(--surface)",
                              color: "var(--primary)",
                            }}
                          >
                            {commit.commitHash.substring(0, 8)}
                          </code>
                          {commit.branch && (
                            <span
                              className="text-xs px-2 py-1 rounded"
                              style={{
                                background: "var(--primary)",
                                color: "white",
                              }}
                            >
                              {commit.branch}
                            </span>
                          )}
                        </div>
                        <p
                          className="font-medium mb-1"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {commit.message}
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {commit.author} •{" "}
                          {new Date(Number(commit.timestamp)).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className="text-lg font-bold mb-1"
                          style={{ color: "var(--primary)" }}
                        >
                          {formatDuration(commit.totalDuration)}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {commit.filesChanged} files • +{commit.linesAdded} -
                          {commit.linesDeleted}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
