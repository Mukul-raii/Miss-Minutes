"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Code2,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Sample project data
const sampleData = {
  name: "Miss-Minutes",
  description: "Time tracking extension for developers",
  timeSpent: "127h 45m",
  commits: 342,
  lastActive: "2 hours ago",
  languages: [
    {
      name: "TypeScript",
      duration: 458700000,
      percent: 65.2,
      color: "#3178c6",
    },
    {
      name: "JavaScript",
      duration: 173580000,
      percent: 24.7,
      color: "#f7df1e",
    },
    { name: "CSS", duration: 71100000, percent: 10.1, color: "#264de4" },
  ],
  trend: [45, 52, 48, 61, 58, 67, 73],
};

// Theme card components (simplified versions from ShowcaseClient.tsx)
function CardRetro({ data }: { data: typeof sampleData }) {
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
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-[#E7E0D3]">
          {data.languages.map((lang) => (
            <div
              key={lang.name}
              style={{ width: `${lang.percent}%`, backgroundColor: lang.color }}
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

function CardGithub({ data }: { data: typeof sampleData }) {
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
      </div>
    </div>
  );
}

function CardCyberpunk({ data }: { data: typeof sampleData }) {
  return (
    <div className="bg-black border border-cyan-500/50 p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
      <div className="mb-6 relative z-10">
        <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 uppercase italic tracking-tighter">
          {data.name}
        </h3>
        <div className="text-pink-500 text-xs font-mono mt-1 tracking-widest">
          SYSTEM_ONLINE
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 font-mono text-sm">
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

function CardBento({ data }: { data: typeof sampleData }) {
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

function CardTerminal({ data }: { data: typeof sampleData }) {
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

function CardBrutalist({ data }: { data: typeof sampleData }) {
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

const themes = [
  { id: "retro", name: "Retro Warm", component: CardRetro },
  { id: "github", name: "GitHub Classic", component: CardGithub },
  { id: "cyberpunk", name: "Cyberpunk Neon", component: CardCyberpunk },
  { id: "bento", name: "Bento Glass", component: CardBento },
  { id: "terminal", name: "Terminal CLI", component: CardTerminal },
  { id: "brutalist", name: "Neo-Brutalist", component: CardBrutalist },
];

export function ThemeShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTheme = () => {
    setCurrentIndex((prev) => (prev + 1) % themes.length);
  };

  const prevTheme = () => {
    setCurrentIndex((prev) => (prev - 1 + themes.length) % themes.length);
  };

  const CurrentCard = themes[currentIndex].component;

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Palette className="w-4 h-4" />
            <span className="text-sm font-medium">20+ Beautiful Themes</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Embed Your Stats Anywhere
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Showcase your coding journey with stunning, customizable cards.
            <span className="text-foreground font-semibold">
              {" "}
              Live analytics
            </span>{" "}
            that update in real-time. Copy, paste, and watch your projects come
            to life.
          </p>
        </div>

        {/* Theme Carousel */}
        <div className="relative">
          <div className="max-w-2xl mx-auto mb-8">
            {/* Theme name and navigation */}
            <div className="flex items-center justify-between mb-8">
              <Button
                onClick={prevTheme}
                variant="outline"
                size="icon"
                className="rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <div className="text-center">
                <h3 className="text-2xl font-bold mb-1">
                  {themes[currentIndex].name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Theme {currentIndex + 1} of {themes.length}
                </p>
              </div>

              <Button
                onClick={nextTheme}
                variant="outline"
                size="icon"
                className="rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Theme card display */}
            <div className="bg-muted/30 p-8 rounded-2xl border min-h-[300px] flex items-center justify-center">
              <div className="w-full max-w-md mx-auto transform transition-all duration-300 hover:scale-105">
                <CurrentCard data={sampleData} />
              </div>
            </div>

            {/* Dots indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {themes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "w-8 bg-primary"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to theme ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="text-center p-6 rounded-2xl bg-card border">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Real-Time Updates</h3>
            <p className="text-muted-foreground text-sm">
              Your stats update automatically as you code. No manual refresh
              needed.
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-card border">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Code2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">One-Click Embed</h3>
            <p className="text-muted-foreground text-sm">
              Copy the code snippet and paste it anywhere—GitHub, portfolio,
              blog.
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-card border">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Palette className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">20+ Unique Styles</h3>
            <p className="text-muted-foreground text-sm">
              From retro to cyberpunk, minimal to brutalist. Pick your vibe.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
