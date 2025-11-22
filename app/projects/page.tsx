import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Link from "next/link";
import { FolderGit2, Clock, Calendar, Code } from "lucide-react";
import { prisma } from "@/lib/prisma";

function formatDuration(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);

  // @ts-expect-error - session user id
  const userId = session?.user?.id;

  // Fetch all projects with aggregated stats
  const projects = await prisma.project.findMany({
    where: {
      userId,
    },
    include: {
      activities: {
        select: {
          duration: true,
          language: true,
        },
      },
      commits: {
        select: {
          id: true,
        },
      },
      _count: {
        select: {
          activities: true,
          commits: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  // Calculate stats for each project
  const projectsWithStats = projects.map((project) => {
    const totalDuration = project.activities.reduce(
      (sum, activity) => sum + activity.duration,
      0
    );

    // Get unique languages
    const languageMap = new Map<string, number>();
    project.activities.forEach((activity) => {
      const current = languageMap.get(activity.language) || 0;
      languageMap.set(activity.language, current + activity.duration);
    });

    const topLanguages = Array.from(languageMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([language]) => language);

    return {
      ...project,
      totalDuration,
      topLanguages,
      activityCount: project._count.activities,
      commitCount: project._count.commits,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">
            View all your tracked projects and their analytics
          </p>
        </div>
        <div className="px-4 py-2 rounded-lg bg-muted">
          <span className="text-sm font-medium">
            {projectsWithStats.length}{" "}
            {projectsWithStats.length === 1 ? "Project" : "Projects"}
          </span>
        </div>
      </div>

      {/* Main Content */}
      {projectsWithStats.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-muted">
            <FolderGit2 className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
          <p className="text-center max-w-md mb-6 text-muted-foreground">
            Start coding in VS Code with the CodeChrono extension to see your
            projects here.
          </p>
          <Link
            href="/dashboard"
            className="px-6 py-2.5 rounded-lg font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Back to Dashboard
          </Link>
        </div>
      ) : (
        // Projects Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectsWithStats.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group block"
            >
              <div className="p-6 rounded-lg border bg-card transition-all duration-200 hover:shadow-lg hover:border-primary/50">
                {/* Project Icon & Name */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 group-hover:scale-110 transition-transform">
                    <FolderGit2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <p
                      className="text-xs truncate text-muted-foreground"
                      title={project.path}
                    >
                      {project.path}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Total Time:
                    </span>
                    <span className="text-sm font-semibold ml-auto">
                      {formatDuration(project.totalDuration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Activities:
                    </span>
                    <span className="text-sm font-semibold ml-auto">
                      {project.activityCount}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Commits:
                    </span>
                    <span className="text-sm font-semibold ml-auto">
                      {project.commitCount}
                    </span>
                  </div>
                </div>

                {/* Top Languages */}
                {project.topLanguages.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-xs font-medium mb-2 text-muted-foreground">
                      Top Languages
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.topLanguages.map((language) => (
                        <span
                          key={language}
                          className="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Last Updated */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Last updated:{" "}
                    {new Date(project.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
