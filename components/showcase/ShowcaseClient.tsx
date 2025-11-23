"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";

interface Project {
  id: string;
  name: string;
}

interface ProjectData {
  name: string;
  description: string;
  timeSpent: string;
  commits: number;
  lastActive: string;
  languages: Array<{
    name: string;
    duration: number;
    percent: number;
    color: string;
  }>;
  trend: number[];
}

interface ShowcaseClientProps {
  projects: Project[];
  apiToken: string;
}

const THEMES = [
  { id: "retro", name: "1. Retro Warm" },
  { id: "github", name: "2. GitHub Classic" },
  { id: "modern-dark", name: "3. Modern Dark" },
  { id: "brutalist", name: "4. Neo-Brutalist" },
  { id: "minimal", name: "5. Ultra Minimal" },
  { id: "bento", name: "6. Bento Glass" },
  { id: "terminal", name: "7. Terminal CLI" },
  { id: "gradient", name: "8. Gradient Accent" },
  { id: "compact", name: "9. Compact Row" },
  { id: "analytics", name: "10. Analytics Detailed" },
  { id: "cyberpunk", name: "11. Cyberpunk Neon" },
  { id: "notion", name: "12. Doc/Wiki Style" },
  { id: "media-player", name: "13. Media Player" },
  { id: "matrix", name: "14. Data Matrix" },
  { id: "paper", name: "15. Paper Sketch" },
  { id: "rpg", name: "16. RPG Stats" },
  { id: "swiss", name: "17. Swiss Grid" },
  { id: "neumorphism", name: "18. Soft Neumorphism" },
  { id: "stacked", name: "19. 3D Stacked" },
  { id: "code-snippet", name: "20. Code Editor" },
];

export default function ShowcaseClient({
  projects,
  apiToken,
}: ShowcaseClientProps) {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedTheme, setSelectedTheme] = useState<string>("retro");
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchProjectData = useCallback(async () => {
    if (!selectedProject) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/public/projects/${selectedProject}?apiKey=${apiToken}`
      );
      if (response.ok) {
        const data = await response.json();
        setProjectData(data);
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
    }
    setLoading(false);
  }, [selectedProject, apiToken]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  const generateCode = () => {
    const baseUrl = window.location.origin;
    return `<!-- Miss-Minutes Project Card -->
<div id="miss-minutes-card"></div>
<script>
  fetch('${baseUrl}/api/public/projects/${selectedProject}?apiKey=${apiToken}')
    .then(res => res.json())
    .then(data => {
      const card = createProjectCard(data, '${selectedTheme}');
      document.getElementById('miss-minutes-card').innerHTML = card;
    });

  function createProjectCard(data, theme) {
    // Theme: ${selectedTheme}
    ${getThemeTemplate(selectedTheme)}
  }
</script>
<style>
  ${getThemeStyles()}
</style>`;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generateCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 ">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Project Showcase</h1>
          <p className="text-muted-foreground">
            Create embeddable project cards for your personal website
          </p>
        </div>

        {/* Controls */}
        <Card className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Project
              </label>
              <Select
                value={selectedProject}
                onValueChange={setSelectedProject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Theme
              </label>
              <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {THEMES.map((theme) => (
                    <SelectItem key={theme.id} value={theme.id}>
                      {theme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Preview */}
        {selectedProject && projectData && (
          <>
            <div>
              <h2 className="text-xl font-bold mb-4">Preview</h2>
              <div className="bg-muted/30 p-8 rounded-lg border">
                <div className="max-w-md mx-auto">
                  <ProjectCard data={projectData} theme={selectedTheme} />
                </div>
              </div>
            </div>

            {/* Code */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Embed Code</h2>
                <Button onClick={copyCode} variant="outline" size="sm">
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>
              <div className="rounded-lg overflow-hidden border bg-zinc-950">
                <pre className="p-4 overflow-x-auto text-sm">
                  <code className="text-gray-300">{generateCode()}</code>
                </pre>
              </div>
            </div>

            {/* API Info */}
            <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                📡 API Endpoint
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                Your project stats are available at:
              </p>
              <code className="text-xs bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded block overflow-x-auto">
                {window.location.origin}/api/public/projects/{selectedProject}
                ?apiKey={apiToken}
              </code>
            </Card>
          </>
        )}

        {!selectedProject && (
          <div className="text-center py-16 text-muted-foreground">
            Select a project to get started
          </div>
        )}

        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
}

// Component to render the project card preview
function ProjectCard({ data, theme }: { data: ProjectData; theme: string }) {
  const themes: Record<string, React.FC<{ data: ProjectData }>> = {
    retro: CardRetro,
    github: CardGithub,
    "modern-dark": CardModernDark,
    brutalist: CardBrutalist,
    minimal: CardMinimal,
    bento: CardBento,
    terminal: CardTerminal,
    gradient: CardGradient,
    compact: CardCompact,
    analytics: CardAnalytics,
    cyberpunk: CardCyberpunk,
    notion: CardNotion,
    "media-player": CardMediaPlayer,
    matrix: CardMatrix,
    paper: CardPaper,
    rpg: CardRPG,
    swiss: CardSwiss,
    neumorphism: CardNeumorphism,
    stacked: CardStacked,
    "code-snippet": CardCodeSnippet,
  };

  const CardComponent = themes[theme] || CardRetro;
  return <CardComponent data={data} />;
}

// Retro Warm Theme
function CardRetro({ data }: { data: ProjectData }) {
  return (
    <div className="bg-[#FFFBF0] border border-[#E7E0D3] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-[#78350F]">{data.name}</h3>
          <p className="text-[#92400E] text-sm mt-1">{data.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/50 p-3 rounded-xl border border-[#E7E0D3]">
          <div className="text-[#9A3412] text-xs font-medium uppercase tracking-wide mb-1">
            Total Time
          </div>
          <div className="text-[#78350F] font-black text-xl">
            {data.timeSpent}
          </div>
        </div>
        <div className="bg-white/50 p-3 rounded-xl border border-[#E7E0D3]">
          <div className="text-[#9A3412] text-xs font-medium uppercase tracking-wide mb-1">
            Commits
          </div>
          <div className="text-[#78350F] font-black text-xl">
            {data.commits}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium text-[#92400E]">
          <span>Languages</span>
        </div>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-[#E7E0D3]">
          {data.languages.map((lang) => (
            <div
              key={lang.name}
              style={{
                width: `${lang.percent}%`,
                backgroundColor: lang.color,
              }}
              title={`${lang.name}: ${lang.percent.toFixed(1)}%`}
            />
          ))}
        </div>
        <div className="flex gap-3 mt-2 flex-wrap">
          {data.languages.map((lang) => (
            <div key={lang.name} className="flex items-center gap-1.5 text-xs">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: lang.color }}
              />
              <span className="text-[#92400E] font-medium">{lang.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// GitHub Classic Theme
function CardGithub({ data }: { data: ProjectData }) {
  return (
    <div className="bg-white border border-gray-300 rounded-md p-4 hover:border-blue-500 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-blue-600 text-base">{data.name}</h3>
      </div>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {data.description}
      </p>
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.languages[0]?.color }}
          />
          <span>{data.languages[0]?.name}</span>
        </div>
        <div>⭐ {data.commits} commits</div>
        <div>⏱️ {data.timeSpent}</div>
        <div className="text-gray-400">Updated {data.lastActive}</div>
      </div>
    </div>
  );
}

// Modern Dark Theme
function CardModernDark({ data }: { data: ProjectData }) {
  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-5 text-gray-300">
      <h3 className="text-white text-lg font-bold mb-2">{data.name}</h3>
      <p className="text-gray-400 text-sm mb-6">{data.description}</p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/5 p-3 rounded-lg text-center">
          <div className="text-xs text-gray-500 mb-1">Time</div>
          <div className="text-white font-mono">{data.timeSpent}</div>
        </div>
        <div className="bg-white/5 p-3 rounded-lg text-center">
          <div className="text-xs text-gray-500 mb-1">Commits</div>
          <div className="text-white font-mono">{data.commits}</div>
        </div>
      </div>
    </div>
  );
}

// Brutalist Theme
function CardBrutalist({ data }: { data: ProjectData }) {
  return (
    <div className="bg-[#FFDE00] border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="text-xl font-black uppercase mb-3">{data.name}</h3>
      <p className="font-bold text-sm mb-4">
        {data.description.substring(0, 60)}...
      </p>
      <div className="flex gap-4">
        <div className="bg-white border-2 border-black p-2 flex-1 text-center">
          <div className="text-xs font-bold mb-1">TIME</div>
          <div className="font-black">{data.timeSpent}</div>
        </div>
        <div className="bg-white border-2 border-black p-2 flex-1 text-center">
          <div className="text-xs font-bold mb-1">COMMITS</div>
          <div className="font-black">{data.commits}</div>
        </div>
      </div>
    </div>
  );
}

// Minimal Theme
function CardMinimal({ data }: { data: ProjectData }) {
  return (
    <div className="bg-white p-6 rounded-2xl">
      <h3 className="text-lg font-medium text-gray-900 mb-2">{data.name}</h3>
      <p className="text-sm text-gray-500 mb-6">{data.description}</p>
      <div className="flex items-center gap-6 border-t border-gray-100 pt-4">
        <div>
          <div className="text-xs text-gray-400">Time</div>
          <div className="font-medium">{data.timeSpent}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Commits</div>
          <div className="font-medium">{data.commits}</div>
        </div>
      </div>
    </div>
  );
}

// Bento Glass Theme
function CardBento({ data }: { data: ProjectData }) {
  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2rem] p-6 shadow-xl shadow-indigo-500/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
      <div className="relative z-10">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{data.name}</h3>
        <p className="text-sm text-gray-600 mb-6">{data.description}</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 border border-white/60">
            <div className="text-xs text-gray-500 mb-1">Time</div>
            <div className="font-bold">{data.timeSpent}</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 border border-white/60">
            <div className="text-xs text-gray-500 mb-1">Commits</div>
            <div className="font-bold">{data.commits}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Terminal CLI Theme
function CardTerminal({ data }: { data: ProjectData }) {
  return (
    <div className="bg-[#1e1e1e] rounded-md p-4 font-mono text-sm shadow-2xl border border-gray-800">
      <div className="flex gap-1.5 mb-4 border-b border-gray-800 pb-3">
        <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
        <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
        <div className="ml-auto text-xs text-gray-500">bash</div>
      </div>
      <div className="space-y-2 text-gray-300">
        <div className="flex gap-2">
          <span className="text-green-400">$</span>
          <span>cat project.json</span>
        </div>
        <div className="pl-4 border-l-2 border-gray-700 space-y-1 py-1 text-xs">
          <div>
            <span className="text-blue-400">name:</span> "{data.name}"
          </div>
          <div>
            <span className="text-blue-400">time:</span> "{data.timeSpent}"
          </div>
          <div>
            <span className="text-blue-400">commits:</span> {data.commits}
          </div>
        </div>
      </div>
    </div>
  );
}

// Gradient Accent Theme
function CardGradient({ data }: { data: ProjectData }) {
  return (
    <div className="relative bg-zinc-900 rounded-xl p-6 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500"></div>
      <h3 className="text-white text-lg font-bold mb-2">{data.name}</h3>
      <p className="text-gray-400 text-sm mb-6">{data.description}</p>
      <div className="grid grid-cols-3 gap-4 border-t border-zinc-800 pt-4">
        <div>
          <div className="text-xs text-zinc-500 mb-1">Time</div>
          <div className="text-white font-medium">{data.timeSpent}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500 mb-1">Commits</div>
          <div className="text-white font-medium">{data.commits}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500 mb-1">Lang</div>
          <div className="text-white font-medium">
            {data.languages[0]?.name}
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact Row Theme
function CardCompact({ data }: { data: ProjectData }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-4 shadow-sm hover:border-blue-400 transition-colors">
      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 text-xl">
        📊
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="font-semibold text-gray-900 truncate">{data.name}</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>⏱️ {data.timeSpent}</span>
          <span>⭐ {data.commits}</span>
        </div>
      </div>
    </div>
  );
}

// Analytics Detailed Theme
function CardAnalytics({ data }: { data: ProjectData }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-5 border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900">{data.name}</h3>
        <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
          Active
        </div>
      </div>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">{data.description}</p>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Total Time</div>
            <div className="text-xl font-bold text-gray-900">
              {data.timeSpent}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Commits</div>
            <div className="text-xl font-bold text-gray-900">
              {data.commits}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cyberpunk Neon Theme
function CardCyberpunk({ data }: { data: ProjectData }) {
  return (
    <div className="bg-black border border-cyan-500/50 p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-50"></div>
      <div className="mb-6 relative z-10">
        <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 uppercase italic tracking-tighter">
          {data.name}
        </h3>
        <div className="text-pink-500 text-xs font-mono mt-1 tracking-widest">
          SYSTEM_ONLINE
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6 font-mono text-sm">
        <div className="border-l-2 border-cyan-500 pl-3">
          <div className="text-cyan-400 text-xs">TIME</div>
          <div className="text-white">{data.timeSpent}</div>
        </div>
        <div className="border-l-2 border-pink-500 pl-3">
          <div className="text-pink-400 text-xs">COMMITS</div>
          <div className="text-white">{data.commits}</div>
        </div>
      </div>
    </div>
  );
}

// Notion/Doc Style Theme
function CardNotion({ data }: { data: ProjectData }) {
  return (
    <div className="bg-white hover:bg-gray-50 transition-colors p-6 rounded-sm">
      <div className="flex items-start gap-3 mb-6">
        <div className="text-3xl">⏱️</div>
        <div className="flex-1 pt-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{data.name}</h3>
          <p className="text-gray-600 text-sm">{data.description}</p>
        </div>
      </div>
      <div className="space-y-3 font-serif">
        <div className="flex items-baseline justify-between border-b border-gray-100 pb-1 border-dashed">
          <span className="text-gray-600">Total Time</span>
          <span className="font-medium text-gray-900">{data.timeSpent}</span>
        </div>
        <div className="flex items-baseline justify-between border-b border-gray-100 pb-1 border-dashed">
          <span className="text-gray-600">Commits</span>
          <span className="font-medium text-gray-900">{data.commits}</span>
        </div>
      </div>
    </div>
  );
}

// Media Player Theme
function CardMediaPlayer({ data }: { data: ProjectData }) {
  return (
    <div className="bg-neutral-900 text-white p-6 rounded-3xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg shadow-lg flex items-center justify-center text-2xl">
          💻
        </div>
        <div>
          <h3 className="font-bold text-lg">{data.name}</h3>
          <p className="text-sm text-neutral-400">{data.commits} commits</p>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex justify-between text-xs text-neutral-400 mb-2 font-mono">
          <span>0:00</span>
          <span>{data.timeSpent}</span>
        </div>
        <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 h-full w-3/4"></div>
        </div>
      </div>
    </div>
  );
}

// Data Matrix Theme
function CardMatrix({ data }: { data: ProjectData }) {
  return (
    <div className="bg-white border border-gray-200 text-sm">
      <div className="bg-gray-50 border-b border-gray-200 p-3">
        <span className="font-mono font-bold text-gray-700">
          PROJECT: {data.name}
        </span>
      </div>
      <div className="divide-y divide-gray-100">
        <div className="grid grid-cols-2 divide-x divide-gray-100">
          <div className="p-3">
            <div className="text-xs text-gray-500 mb-1">Total Time</div>
            <div className="font-mono font-bold">{data.timeSpent}</div>
          </div>
          <div className="p-3">
            <div className="text-xs text-gray-500 mb-1">Commits</div>
            <div className="font-mono font-bold">{data.commits}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Paper Sketch Theme
function CardPaper({ data }: { data: ProjectData }) {
  return (
    <div className="bg-[#fffdf0] border-2 border-gray-800 rounded-sm p-5 shadow-[4px_4px_0px_rgba(0,0,0,0.15)] rotate-1 hover:rotate-0 transition-transform relative">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-yellow-100/80 border-l border-r border-white/40 shadow-sm rotate-[-2deg]"></div>
      <h3 className="text-2xl font-bold text-gray-800 mb-4">
        {data.name}{" "}
        <span className="text-gray-400 text-sm font-normal">(v1)</span>
      </h3>
      <ul className="list-disc pl-5 space-y-2 mb-6 text-gray-700 font-medium">
        <li>{data.timeSpent} coding time</li>
        <li>{data.commits} total commits</li>
        <li>Using {data.languages[0]?.name}</li>
      </ul>
    </div>
  );
}

// RPG Stats Theme
function CardRPG({ data }: { data: ProjectData }) {
  return (
    <div className="bg-slate-800 border-4 border-slate-600 rounded p-1 text-white font-mono shadow-xl">
      <div className="border-2 border-slate-700 bg-slate-900 p-4">
        <div className="flex items-center gap-3 mb-5">
          <div className="text-3xl">⚔️</div>
          <div>
            <h3 className="font-bold text-yellow-400">{data.name}</h3>
            <div className="text-xs text-slate-400">Level 42 Developer</div>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-blue-400">XP (Time)</span>
              <span>{data.timeSpent}</span>
            </div>
            <div className="w-full bg-slate-700 h-2 rounded-full">
              <div className="bg-blue-500 h-2 rounded-full w-3/4"></div>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-green-400">Commits:</span>
            <span>{data.commits}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Swiss Grid Theme
function CardSwiss({ data }: { data: ProjectData }) {
  return (
    <div className="bg-[#f0f0f0] aspect-square flex flex-col">
      <div className="bg-[#ff3333] p-4 text-white">
        <h3 className="text-2xl font-bold leading-none tracking-tighter">
          {data.name}
        </h3>
      </div>
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-baseline">
            <span className="text-xs uppercase tracking-wider">Time</span>
            <span className="text-2xl font-bold">{data.timeSpent}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-xs uppercase tracking-wider">Commits</span>
            <span className="text-2xl font-bold">{data.commits}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Neumorphism Theme
function CardNeumorphism({ data }: { data: ProjectData }) {
  return (
    <div className="bg-[#e0e5ec] p-6 rounded-[30px] shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] text-gray-700">
      <h3 className="text-xl font-bold text-gray-700 mb-2">{data.name}</h3>
      <p className="text-sm text-gray-500 mb-8">
        {data.description.substring(0, 50)}...
      </p>
      <div className="flex justify-between items-center">
        <div className="px-4 py-2 rounded-xl bg-[#e0e5ec] shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,0.5)]">
          <div className="text-xs text-gray-500">Time</div>
          <div className="font-bold">{data.timeSpent}</div>
        </div>
        <div className="px-4 py-2 rounded-xl bg-[#e0e5ec] shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,0.5)]">
          <div className="text-xs text-gray-500">Commits</div>
          <div className="font-bold">{data.commits}</div>
        </div>
      </div>
    </div>
  );
}

// 3D Stacked Theme
function CardStacked({ data }: { data: ProjectData }) {
  return (
    <div className="relative h-full min-h-[160px] group">
      <div className="absolute inset-0 bg-blue-900 rounded-2xl transform translate-x-4 translate-y-4 opacity-20"></div>
      <div className="absolute inset-0 bg-blue-900 rounded-2xl transform translate-x-2 translate-y-2 opacity-40"></div>
      <div className="absolute inset-0 bg-white border border-gray-100 rounded-2xl p-5 shadow-lg flex flex-col justify-between z-10">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{data.name}</h3>
          <p className="text-sm text-gray-600">
            {data.description.substring(0, 60)}...
          </p>
        </div>
        <div className="flex gap-4 text-sm">
          <div>
            <div className="text-xs text-gray-500">Time</div>
            <div className="font-bold">{data.timeSpent}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Commits</div>
            <div className="font-bold">{data.commits}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Code Editor Theme
function CardCodeSnippet({ data }: { data: ProjectData }) {
  return (
    <div className="bg-[#1e1e1e] rounded-lg border border-[#333] font-mono text-sm overflow-hidden shadow-2xl">
      <div className="bg-[#252526] px-4 py-2 flex text-xs text-gray-400 border-b border-[#333]">
        <span className="bg-[#1e1e1e] px-3 py-1 border-t-2 border-blue-500 text-white rounded-t-sm">
          stats.json
        </span>
      </div>
      <div className="p-4 text-blue-300 leading-relaxed">
        <div className="flex">
          <span className="text-gray-500 w-8">1</span>
          <span className="text-yellow-300">{"{"}</span>
        </div>
        <div className="flex">
          <span className="text-gray-500 w-8">2</span>
          <span className="pl-4">
            <span className="text-blue-400">"name"</span>:{" "}
            <span className="text-green-400">"{data.name}"</span>,
          </span>
        </div>
        <div className="flex">
          <span className="text-gray-500 w-8">3</span>
          <span className="pl-4">
            <span className="text-blue-400">"time"</span>:{" "}
            <span className="text-green-400">"{data.timeSpent}"</span>,
          </span>
        </div>
        <div className="flex">
          <span className="text-gray-500 w-8">4</span>
          <span className="pl-4">
            <span className="text-blue-400">"commits"</span>:{" "}
            <span className="text-orange-400">{data.commits}</span>
          </span>
        </div>
        <div className="flex">
          <span className="text-gray-500 w-8">5</span>
          <span className="text-yellow-300">{"}"}</span>
        </div>
      </div>
    </div>
  );
}

// Helper functions for code generation
function getThemeTemplate(theme: string): string {
  const templates: Record<string, string> = {
    retro: `return \`
      <div style="background:#FFFBF0;border:1px solid #E7E0D3;border-radius:1rem;padding:1.5rem">
        <h3 style="color:#78350F;font-size:1.25rem;font-weight:bold">\${data.name}</h3>
        <p style="color:#92400E;font-size:0.875rem;margin-top:0.5rem">\${data.description}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin:1.5rem 0">
          <div style="background:rgba(255,255,255,0.5);padding:0.75rem;border-radius:0.75rem;border:1px solid #E7E0D3">
            <div style="color:#9A3412;font-size:0.75rem;font-weight:500;text-transform:uppercase">Total Time</div>
            <div style="color:#78350F;font-size:1.25rem;font-weight:900">\${data.timeSpent}</div>
          </div>
          <div style="background:rgba(255,255,255,0.5);padding:0.75rem;border-radius:0.75rem;border:1px solid #E7E0D3">
            <div style="color:#9A3412;font-size:0.75rem;font-weight:500;text-transform:uppercase">Commits</div>
            <div style="color:#78350F;font-size:1.25rem;font-weight:900">\${data.commits}</div>
          </div>
        </div>
      </div>
    \`;`,
    github: `return \`
      <div style="background:white;border:1px solid #d0d7de;border-radius:6px;padding:1rem">
        <h3 style="color:#0969da;font-size:1rem;font-weight:600;margin-bottom:0.5rem">\${data.name}</h3>
        <p style="color:#57606a;font-size:0.875rem;margin-bottom:1rem">\${data.description}</p>
        <div style="display:flex;gap:1rem;font-size:0.75rem;color:#57606a">
          <span>⏱️ \${data.timeSpent}</span>
          <span>⭐ \${data.commits} commits</span>
        </div>
      </div>
    \`;`,
  };
  return templates[theme] || templates.retro;
}

function getThemeStyles(): string {
  return `
  #miss-minutes-card {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    max-width: 400px;
  }
  #miss-minutes-card * {
    box-sizing: border-box;
  }
  `;
}
