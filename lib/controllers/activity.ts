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
      syncedCount,
    };
  }

  static async getDashboardStats(userId: string) {
    // Get all projects with their activities
    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        activities: {
          select: {
            duration: true,
            language: true,
            timestamp: true,
          },
        },
      },
    });

    // Calculate total time and stats
    let totalTime = 0;
    const languageMap = new Map<string, number>();
    const dailyMap = new Map<string, number>();
    const hourlyMap = new Map<number, number>();

    projects.forEach((project) => {
      project.activities.forEach((activity) => {
        totalTime += activity.duration;

        // Language stats
        const langDuration = languageMap.get(activity.language) || 0;
        languageMap.set(activity.language, langDuration + activity.duration);

        // Daily activity
        const date = new Date(Number(activity.timestamp)).toLocaleDateString();
        const dailyDuration = dailyMap.get(date) || 0;
        dailyMap.set(date, dailyDuration + activity.duration);

        // Hourly distribution
        const hour = new Date(Number(activity.timestamp)).getHours();
        const hourlyDuration = hourlyMap.get(hour) || 0;
        hourlyMap.set(hour, hourlyDuration + activity.duration);
      });
    });

    // Format project stats
    const projectStats = projects.map((project) => {
      const totalDuration = project.activities.reduce(
        (sum, a) => sum + a.duration,
        0
      );
      const lastActivity = project.activities.reduce(
        (latest, a) =>
          Number(a.timestamp) > Number(latest) ? a.timestamp : latest,
        BigInt(0)
      );

      return {
        id: project.id,
        name: project.name,
        path: project.path,
        totalDuration,
        activityCount: project.activities.length,
        lastActive: lastActivity,
      };
    });

    // Format language stats with percentages
    const languages = Array.from(languageMap.entries())
      .map(([language, duration]) => ({
        language,
        duration,
        percentage: totalTime > 0 ? (duration / totalTime) * 100 : 0,
      }))
      .sort((a, b) => b.duration - a.duration);

    // Format daily activity (last 30 days)
    const dailyActivity = Array.from(dailyMap.entries())
      .map(([date, duration]) => ({ date, duration }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);

    // Format hourly distribution (0-23 hours)
    const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      duration: hourlyMap.get(hour) || 0,
    }));

    const activeProjects = projectStats.filter(
      (p) => p.totalDuration > 0
    ).length;

    return {
      totalTime,
      totalProjects: projects.length,
      activeProjects,
      projects: projectStats.sort((a, b) => b.totalDuration - a.totalDuration),
      languages,
      dailyActivity,
      hourlyDistribution,
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
    };
  }
}
