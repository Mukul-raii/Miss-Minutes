"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface Commit {
  id: string;
  commitHash: string;
  message: string;
  author: string;
  timestamp: bigint;
  branch: string | null;
  totalDuration: number;
  filesChanged: number;
  linesAdded: number;
  linesDeleted: number;
}

interface ProjectData {
  name: string;
  description: string;
  timeSpent: string;
  commits: number;
  languages: { name: string; percentage: number }[];
  trend: number[];
}

interface ProjectDetailClientProps {
  commits: Commit[];
  projectId: string;
  projectData: ProjectData;
  apiToken: string;
}

function formatDuration(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

const THEMES = [
  { id: "retro", name: "Retro Terminal", preview: "🖥️" },
  { id: "github", name: "GitHub Card", preview: "📊" },
  { id: "modern-dark", name: "Modern Dark", preview: "🌙" },
  { id: "brutalist", name: "Brutalist", preview: "⬛" },
  { id: "minimal", name: "Minimal", preview: "✨" },
  { id: "bento", name: "Bento Glass", preview: "💎" },
  { id: "terminal", name: "Terminal CLI", preview: "💻" },
  { id: "gradient", name: "Gradient", preview: "🌈" },
  { id: "compact", name: "Compact Row", preview: "📏" },
  { id: "analytics", name: "Analytics", preview: "📈" },
  { id: "cyberpunk", name: "Cyberpunk", preview: "⚡" },
  { id: "notion", name: "Notion Style", preview: "📝" },
  { id: "media-player", name: "Media Player", preview: "🎵" },
  { id: "matrix", name: "Data Matrix", preview: "🔢" },
  { id: "paper", name: "Paper Sketch", preview: "📄" },
  { id: "rpg", name: "RPG Stats", preview: "⚔️" },
  { id: "swiss", name: "Swiss Design", preview: "🇨🇭" },
  { id: "neumorphism", name: "Neumorphism", preview: "🔘" },
  { id: "stacked", name: "3D Stacked", preview: "📚" },
  { id: "code-snippet", name: "Code Editor", preview: "👨‍💻" },
];

export function ProjectDetailClient({
  commits,
  projectId,
  apiToken,
}: ProjectDetailClientProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0].id);
  const itemsPerPage = 5;

  // Pagination
  const totalPages = Math.ceil(commits.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCommits = commits.slice(startIndex, endIndex);

  const generateEmbedCode = (themeId: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `<!-- CodeChrono Project Card -->
<div id="codechrono-card"></div>
<script>
  fetch('${baseUrl}/api/public/projects/${projectId}?apiKey=${apiToken}')
    .then(res => res.json())
    .then(data => {
      // Render your card with theme: ${themeId}
      // Use data.name, data.timeSpent, data.commits, data.languages
      console.log('Project stats:', data);
    });
</script>`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      {/* Commits Section with Pagination */}
      <div className="p-6 rounded-xl border-border bg-card shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Recent Git Commits (Time Tracked)
          </h2>
          {/*     <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Showcase
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[600px] sm:max-w-[600px]">
              <SheetHeader>
                <SheetTitle>Project Showcase</SheetTitle>
                <SheetDescription>
                  Select a theme to embed your project stats on your website
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Select Theme
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                    {THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setSelectedTheme(theme.id)}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          selectedTheme === theme.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{theme.preview}</span>
                          <span className="text-sm font-medium">
                            {theme.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Embed Code
                  </label>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-[200px]">
                      <code>{generateEmbedCode(selectedTheme)}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2"
                      onClick={() =>
                        copyToClipboard(generateEmbedCode(selectedTheme))
                      }
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>
                    💡 Tip: Visit the{" "}
                    <a
                      href="/showcase"
                      className="text-primary hover:underline"
                    >
                      Showcase page
                    </a>{" "}
                    to preview all themes with live data
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet> */}
        </div>

        <div className="space-y-3 bg-muted">
          {commits.length === 0 ? (
            <p
              className="text-center py-8"
              style={{ color: "var(--text-muted)" }}
            >
              No commits tracked yet. Make commits while the extension is
              running to track time!
            </p>
          ) : (
            <>
              {currentCommits.map((commit) => (
                <div
                  key={commit.id}
                  className="p-4 rounded-lg border-border bg-muted"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <code
                          className="text-xs px-2 py-1 rounded font-mono"
                          style={{
                            background: "hsl(var(--muted))",
                            color: "var(--primary)",
                          }}
                        >
                          {commit.commitHash.substring(0, 8)}
                        </code>
                        {commit.branch && (
                          <span
                            className="text-xs px-2 py-1 rounded font-medium"
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
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
