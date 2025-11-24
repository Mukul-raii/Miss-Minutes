/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";

export class ActivityController {
  static async syncActivities(apiToken: string, logs: any[]) {
    const user = await prisma.user.findUnique({
      where: { apiToken },
    });

    if (!user) {
      throw new Error("Invalid Token");
    }

    let syncedCount = 0;

    // Process logs
    for (const log of logs) {
      // Find or create project
      let project = await prisma.project.findUnique({
        where: {
          userId_path: {
            userId: user.id,
            path: log.projectPath,
          },
        },
      });

      if (!project) {
        project = await prisma.project.create({
          data: {
            name: log.projectPath.split("/").pop() || "Unknown Project",
            path: log.projectPath,
            userId: user.id,
          },
        });
      }

      // Create activity log with commit reference
      await prisma.activityLog.create({
        data: {
          projectId: project.id,
          filePath: log.filePath,
          language: log.language,
          timestamp: log.timestamp,
          duration: log.duration,
          editor: log.editor,
          commitId: log.commitHash || null,
        },
      });
      syncedCount++;
    }

    return {
      success: true,
      message: `Synced ${syncedCount} activities`,
      syncedCount,
    };
  }

  static async syncCommits(apiToken: string, commits: any[]) {
    try {
      const user = await prisma.user.findUnique({
        where: { apiToken },
      });

      if (!user) {
        throw new Error("Invalid Token");
      }

      let syncedCount = 0;

      for (const commit of commits) {
        try {
          // Find or create project
          let project = await prisma.project.findUnique({
            where: {
              userId_path: {
                userId: user.id,
                path: commit.projectPath,
              },
            },
          });

          if (!project) {
            project = await prisma.project.create({
              data: {
                name: commit.projectPath.split("/").pop() || "Unknown Project",
                path: commit.projectPath,
                userId: user.id,
              },
            });
          }

          // Create or update git commit
          await prisma.gitCommit.upsert({
            where: {
              projectId_commitHash: {
                projectId: project.id,
                commitHash: commit.commitHash,
              },
            },
            update: {
              message: commit.message,
              author: commit.author,
              authorEmail: commit.authorEmail,
              timestamp: commit.timestamp,
              filesChanged: commit.filesChanged,
              linesAdded: commit.linesAdded,
              linesDeleted: commit.linesDeleted,
              branch: commit.branch,
            },
            create: {
              projectId: project.id,
              commitHash: commit.commitHash,
              message: commit.message,
              author: commit.author,
              authorEmail: commit.authorEmail,
              timestamp: commit.timestamp,
              filesChanged: commit.filesChanged,
              linesAdded: commit.linesAdded,
              linesDeleted: commit.linesDeleted,
              branch: commit.branch,
            },
          });
          syncedCount++;
        } catch (error) {
          console.error(
            `[syncCommits] Error processing commit ${commit.commitHash}:`,
            error
          );
          throw error;
        }
      }

      // Recalculate commit durations for affected projects
      const projectPaths = [...new Set(commits.map((c) => c.projectPath))];
      for (const projectPath of projectPaths) {
        const project = await prisma.project.findUnique({
          where: {
            userId_path: {
              userId: user.id,
              path: projectPath,
            },
          },
        });

        if (project) {
          await this.calculateCommitDurations(project.id);
        }
      }

      return {
        success: true,
        message: `Synced ${syncedCount} commits`,
        syncedCount,
      };
    } catch (error) {
      console.error("[syncCommits] Error:", error);
      throw error;
    }
  }

  static async syncFileActivities(apiToken: string, fileActivities: any[]) {
    try {
      const user = await prisma.user.findUnique({
        where: { apiToken },
      });

      if (!user) {
        throw new Error("Invalid Token");
      }

      let syncedCount = 0;

      // Process aggregated file activities
      for (const fileActivity of fileActivities) {
        try {
          // Find or create project
          let project = await prisma.project.findUnique({
            where: {
              userId_path: {
                userId: user.id,
                path: fileActivity.projectPath,
              },
            },
          });

          if (!project) {
            project = await prisma.project.create({
              data: {
                name:
                  fileActivity.projectPath.split("/").pop() ||
                  "Unknown Project",
                path: fileActivity.projectPath,
                userId: user.id,
              },
            });
          }

          // Upsert aggregated activity log entry to prevent duplicates
          // This represents the summary of all activities for this file in this commit
          const existingActivity = await prisma.activityLog.findUnique({
            where: {
              projectId_commitId_branch_filePath: {
                projectId: project.id,
                commitId: fileActivity.commitHash,
                branch: fileActivity.branch,
                filePath: fileActivity.filePath,
              },
            },
          });

          let durationToAddToCommit = fileActivity.totalDuration;

          if (existingActivity) {
            // Update existing entry by adding to the duration (in case new activities accumulated)
            const earliestTimestamp =
              BigInt(existingActivity.timestamp) <
              BigInt(fileActivity.firstActivityAt)
                ? BigInt(existingActivity.timestamp)
                : BigInt(fileActivity.firstActivityAt);

            await prisma.activityLog.update({
              where: { id: existingActivity.id },
              data: {
                duration:
                  existingActivity.duration + fileActivity.totalDuration,
                timestamp: earliestTimestamp, // Keep earliest timestamp
              },
            });
            // Only add the new duration, not the total (since existing was already counted)
            durationToAddToCommit = fileActivity.totalDuration;
          } else {
            // Create new entry
            await prisma.activityLog.create({
              data: {
                projectId: project.id,
                filePath: fileActivity.filePath,
                language: fileActivity.language,
                timestamp: fileActivity.firstActivityAt,
                duration: fileActivity.totalDuration,
                editor: fileActivity.editor,
                commitId: fileActivity.commitHash,
                branch: fileActivity.branch,
              },
            });
          }
          syncedCount++;

          // Update the commit's total duration
          const commit = await prisma.gitCommit.findUnique({
            where: {
              projectId_commitHash: {
                projectId: project.id,
                commitHash: fileActivity.commitHash,
              },
            },
          });

          if (commit) {
            await prisma.gitCommit.update({
              where: { id: commit.id },
              data: {
                totalDuration: commit.totalDuration + durationToAddToCommit,
              },
            });
          }
        } catch (error) {
          console.error(
            `[syncFileActivities] Error processing file activity for ${fileActivity.filePath} in commit ${fileActivity.commitHash}:`,
            error
          );
          throw error;
        }
      }

      return {
        success: true,
        message: `Synced ${syncedCount} file activities`,
        syncedCount,
      };
    } catch (error) {
      console.error("[syncFileActivities] Error:", error);
      throw error;
    }
  }

  static async syncDailyStats(apiToken: string, dailyStats: any[]) {
    const user = await prisma.user.findUnique({
      where: { apiToken },
    });

    if (!user) {
      throw new Error("Invalid Token");
    }

    let syncedCount = 0;

    for (const stat of dailyStats) {
      // Find or create project
      let project = await prisma.project.findUnique({
        where: {
          userId_path: {
            userId: user.id,
            path: stat.projectPath,
          },
        },
      });

      if (!project) {
        project = await prisma.project.create({
          data: {
            name: stat.projectPath.split("/").pop() || "Unknown Project",
            path: stat.projectPath,
            userId: user.id,
          },
        });
      }

      // Parse language breakdown
      const languageBreakdown =
        typeof stat.languageBreakdown === "string"
          ? JSON.parse(stat.languageBreakdown)
          : stat.languageBreakdown;

      // Upsert daily stats
      await prisma.dailyStats.upsert({
        where: {
          userId_projectId_date: {
            userId: user.id,
            projectId: project.id,
            date: new Date(stat.date),
          },
        },
        update: {
          totalDuration: {
            increment: stat.totalDuration,
          },
          languageBreakdown,
          filesEdited: {
            increment: stat.filesEdited,
          },
          commitsCount: {
            increment: stat.commitCount,
          },
        },
        create: {
          userId: user.id,
          projectId: project.id,
          date: new Date(stat.date),
          totalDuration: stat.totalDuration,
          languageBreakdown,
          filesEdited: stat.filesEdited,
          commitsCount: stat.commitCount,
        },
      });

      syncedCount++;
    }

    return {
      success: true,
      message: `Synced ${syncedCount} daily stats`,
      syncedCount,
    };
  }

  /**
   * Calculate total duration spent on each commit by summing activities with matching commitId
   */
  static async calculateCommitDurations(projectId: string) {
    const commits = await prisma.gitCommit.findMany({
      where: { projectId },
    });

    for (const commit of commits) {
      // Sum all activity durations for this commit
      const activities = await prisma.activityLog.findMany({
        where: {
          projectId,
          commitId: commit.commitHash,
        },
        select: {
          duration: true,
        },
      });

      const totalDuration = activities.reduce(
        (sum, activity) => sum + activity.duration,
        0
      );

      await prisma.gitCommit.update({
        where: { id: commit.id },
        data: { totalDuration },
      });
    }
  }

  static async getDashboardStats(userId: string) {
    // Fetch from DailyStats instead of aggregating ActivityLog
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await prisma.dailyStats.findMany({
      where: {
        userId,
        date: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        project: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    // Also get current day activities from ActivityLog (not yet aggregated)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTimestamp = BigInt(todayStart.getTime());

    const todayActivities = await prisma.activityLog.findMany({
      where: {
        project: {
          userId,
        },
        timestamp: {
          gte: todayTimestamp,
        },
      },
      include: {
        project: true,
      },
    });

    // Calculate totals
    let totalTime = 0;
    const projectMap = new Map<string, any>();
    const languageMap = new Map<string, number>();
    const dailyMap = new Map<string, number>();

    // Process DailyStats
    dailyStats.forEach((stat) => {
      totalTime += stat.totalDuration;

      // Project stats
      const projectKey = stat.projectId || "unknown";
      if (!projectMap.has(projectKey)) {
        projectMap.set(projectKey, {
          id: stat.project?.id,
          name: stat.project?.name || "Unknown",
          path: stat.project?.path || "",
          totalDuration: 0,
          activityCount: 0,
          lastActive: BigInt(0),
        });
      }
      const projectStat = projectMap.get(projectKey);
      projectStat.totalDuration += stat.totalDuration;
      projectStat.activityCount += stat.filesEdited;

      // Language breakdown
      const breakdown = stat.languageBreakdown as Record<string, number> | null;
      if (breakdown) {
        Object.entries(breakdown).forEach(([lang, duration]) => {
          languageMap.set(lang, (languageMap.get(lang) || 0) + duration);
        });
      }

      // Daily activity
      const dateStr = stat.date.toISOString().split("T")[0];
      dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + stat.totalDuration);
    });

    // Process today's activities (not yet in DailyStats)
    const todayDateStr = new Date().toISOString().split("T")[0];
    let todayDuration = 0;
    const todayLanguages = new Map<string, number>();

    console.log(
      `[Dashboard] Processing ${todayActivities.length} activities for today (${todayDateStr})`
    );

    todayActivities.forEach((activity) => {
      todayDuration += activity.duration;
      totalTime += activity.duration;

      // Project stats
      const projectKey = activity.projectId;
      if (!projectMap.has(projectKey)) {
        projectMap.set(projectKey, {
          id: activity.project.id,
          name: activity.project.name,
          path: activity.project.path,
          totalDuration: 0,
          activityCount: 0,
          lastActive: BigInt(0),
        });
      }
      const projectStat = projectMap.get(projectKey);
      projectStat.totalDuration += activity.duration;
      projectStat.activityCount++;
      projectStat.lastActive =
        activity.timestamp > projectStat.lastActive
          ? activity.timestamp
          : projectStat.lastActive;

      // Language stats
      languageMap.set(
        activity.language,
        (languageMap.get(activity.language) || 0) + activity.duration
      );
      todayLanguages.set(
        activity.language,
        (todayLanguages.get(activity.language) || 0) + activity.duration
      );
    });

    // Add today's duration to daily map
    if (todayDuration > 0) {
      dailyMap.set(
        todayDateStr,
        (dailyMap.get(todayDateStr) || 0) + todayDuration
      );
      console.log(
        `[Dashboard] Added today's duration: ${todayDuration}ms to date ${todayDateStr}`
      );
    } else {
      console.log(`[Dashboard] No activity for today yet`);
    }

    const projects = Array.from(projectMap.values()).sort(
      (a, b) => b.totalDuration - a.totalDuration
    );

    const languages = Array.from(languageMap.entries())
      .map(([language, duration]) => ({
        language,
        duration,
        percentage: totalTime > 0 ? (duration / totalTime) * 100 : 0,
      }))
      .sort((a, b) => b.duration - a.duration);

    const dailyActivity = Array.from(dailyMap.entries())
      .map(([date, duration]) => ({ date, duration }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    console.log(
      `[Dashboard] Final dailyActivity array:`,
      dailyActivity.map((d) => `${d.date}: ${d.duration}ms`)
    );

    const activeProjects = projects.filter((p) => p.totalDuration > 0).length;

    return {
      totalTime,
      totalProjects: projectMap.size,
      activeProjects,
      projects,
      languages,
      dailyActivity,
      hourlyDistribution: [], // Can be added later if needed from ActivityLog
    };
  }

  static async getProjects(userId: string) {
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      path: project.path,
      userId: project.userId,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    }));
  }

  static async getProject(userId: string, projectId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    return {
      id: project.id,
      name: project.name,
      path: project.path,
      userId: project.userId,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    };
  }

  static async getProjectDetails(userId: string, projectId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
      include: {
        activities: {
          orderBy: { timestamp: "desc" },
        },
        commits: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    // Calculate total duration
    const totalDuration = project.activities.reduce(
      (sum, a) => sum + a.duration,
      0
    );

    // Language breakdown
    const languageMap = new Map<string, number>();
    project.activities.forEach((activity) => {
      const current = languageMap.get(activity.language) || 0;
      languageMap.set(activity.language, current + activity.duration);
    });

    const topLanguages = Array.from(languageMap.entries())
      .map(([language, duration]) => ({
        language,
        duration,
        percentage: totalDuration > 0 ? (duration / totalDuration) * 100 : 0,
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    // File breakdown
    const fileMap = new Map<string, number>();
    project.activities.forEach((activity) => {
      const current = fileMap.get(activity.filePath) || 0;
      fileMap.set(activity.filePath, current + activity.duration);
    });

    const topFiles = Array.from(fileMap.entries())
      .map(([filePath, duration]) => ({ filePath, duration }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    // Daily activity (last 30 days)
    const dailyMap = new Map<string, number>();
    project.activities.forEach((activity) => {
      const date = new Date(Number(activity.timestamp)).toLocaleDateString();
      const current = dailyMap.get(date) || 0;
      dailyMap.set(date, current + activity.duration);
    });

    const dailyActivity = Array.from(dailyMap.entries())
      .map(([date, duration]) => ({ date, duration }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);

    // Recent activities
    const recentActivities = project.activities
      .slice(0, 20)
      .map((activity) => ({
        id: activity.id,
        projectId: activity.projectId,
        filePath: activity.filePath,
        language: activity.language,
        timestamp: activity.timestamp,
        duration: activity.duration,
        editor: activity.editor,
        commitId: activity.commitId,
        createdAt: activity.createdAt.toISOString(),
      }));

    // Format commits with activity counts
    const commits = await Promise.all(
      project.commits.map(async (commit) => {
        const activityCount = await prisma.activityLog.count({
          where: {
            projectId: project.id,
            commitId: commit.commitHash,
          },
        });

        return {
          id: commit.id,
          commitHash: commit.commitHash,
          message: commit.message,
          author: commit.author,
          authorEmail: commit.authorEmail,
          timestamp: commit.timestamp,
          totalDuration: commit.totalDuration,
          filesChanged: commit.filesChanged,
          linesAdded: commit.linesAdded,
          linesDeleted: commit.linesDeleted,
          branch: commit.branch,
          activityCount,
          createdAt: commit.createdAt.toISOString(),
        };
      })
    );

    return {
      id: project.id,
      name: project.name,
      path: project.path,
      totalDuration,
      activityCount: project.activities.length,
      topLanguages,
      topFiles,
      dailyActivity,
      recentActivities,
      commits: commits.slice(0, 50), // Return last 50 commits
    };
  }
}
