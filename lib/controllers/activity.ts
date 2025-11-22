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

      await prisma.activityLog.create({
        data: {
          projectId: project.id,
          filePath: log.filePath,
          language: log.language,
          timestamp: log.timestamp,
          duration: log.duration,
          editor: log.editor,
        },
      });
      syncedCount++;
    }

    return {
      success: true,
      message: `Synced ${syncedCount} activities`,
    };
  }

  static async getDashboardStats(userId: string) {
    // 1. Total Duration per Language
    const languageStats = await prisma.activityLog.groupBy({
      by: ["language"],
      where: {
        project: {
          userId: userId,
        },
      },
      _sum: {
        duration: true,
      },
    });

    // 2. Total Duration per Project
    const projectStats = await prisma.activityLog.groupBy({
      by: ["projectId"],
      where: {
        project: {
          userId: userId,
        },
      },
      _sum: {
        duration: true,
      },
    });

    // Fetch project names
    const projects = await prisma.project.findMany({
      where: {
        id: {
          in: projectStats.map((p) => p.projectId),
        },
      },
      select: {
        id: true,
        name: true,
        path: true,
      },
    });

    const formattedProjectStats = projectStats.map((stat) => {
      const project = projects.find((p) => p.id === stat.projectId);
      return {
        id: stat.projectId,
        name: project?.name || "Unknown",
        path: project?.path || "",
        totalDuration: stat._sum.duration || 0,
      };
    });

    const formattedLanguageStats = languageStats.map((stat) => ({
      language: stat.language,
      totalDuration: stat._sum.duration || 0,
    }));

    const totalDuration = formattedLanguageStats.reduce(
      (acc, curr) => acc + curr.totalDuration,
      0
    );

    return {
      totalDuration,
      projects: formattedProjectStats,
      languages: formattedLanguageStats,
    };
  }
}
