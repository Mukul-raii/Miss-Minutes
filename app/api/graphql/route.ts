/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";
import { createSchema, createYoga } from "graphql-yoga";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { ActivityController } from "@/lib/controllers/activity";
import { GraphQLScalarType, Kind } from "graphql";

/*
  ✔ Supports GraphQL queries & mutations
  ✔ Uses GraphQL-Yoga correctly with Next.js App Router
  ✔ Fixes Vercel type error for GET/POST handlers
  ✔ Supports session authentication for dashboard stats
  ✔ Supports Bearer token for extension syncActivity
*/

export const dynamic = "force-dynamic"; // Required for Yoga route

// =======================
// 1. GraphQL Schema
// =======================

const typeDefs = `
  scalar BigInt

  type ActivityLog {
    id: ID!
    projectId: String!
    filePath: String!
    language: String!
    timestamp: BigInt!
    duration: Int!
    editor: String
    commitId: String
    createdAt: String!
  }

  input ActivityInput {
    projectPath: String!
    filePath: String!
    language: String!
    timestamp: BigInt!
    duration: Int!
    editor: String
    commitHash: String
  }

  input FileActivityInput {
    projectPath: String!
    commitHash: String!
    branch: String!
    filePath: String!
    language: String!
    totalDuration: Int!
    activityCount: Int!
    firstActivityAt: BigInt!
    lastActivityAt: BigInt!
    editor: String
  }

  input CommitInput {
    projectPath: String!
    commitHash: String!
    message: String!
    author: String!
    authorEmail: String!
    timestamp: BigInt!
    filesChanged: Int!
    linesAdded: Int!
    linesDeleted: Int!
    branch: String
  }

  input DailyStatsInput {
    date: String!
    projectPath: String!
    totalDuration: Int!
    languageBreakdown: String!
    filesEdited: Int!
    commitCount: Int!
  }

  type SyncResponse {
    success: Boolean!
    message: String!
    syncedCount: Int!
  }

  type GitCommit {
    id: ID!
    commitHash: String!
    message: String!
    author: String!
    authorEmail: String!
    timestamp: BigInt!
    totalDuration: Int!
    filesChanged: Int!
    linesAdded: Int!
    linesDeleted: Int!
    branch: String
    activityCount: Int!
    createdAt: String!
  }

  type LanguageStat {
    language: String!
    duration: Int!
    percentage: Float!
  }

  type DailyActivity {
    date: String!
    duration: Int!
  }

  type HourlyDistribution {
    hour: Int!
    duration: Int!
  }

  type ProjectStat {
    id: ID!
    name: String!
    path: String!
    totalDuration: Int!
    activityCount: Int!
    lastActive: BigInt!
  }

  type DashboardStats {
    totalTime: Int!
    totalProjects: Int!
    activeProjects: Int!
    projects: [ProjectStat!]!
    languages: [LanguageStat!]!
    dailyActivity: [DailyActivity!]!
    hourlyDistribution: [HourlyDistribution!]!
  }

  type Project {
    id: ID!
    name: String!
    path: String!
    userId: String!
    createdAt: String!
    updatedAt: String!
  }

  type ProjectDetails {
    id: ID!
    name: String!
    path: String!
    totalDuration: Int!
    activityCount: Int!
    topLanguages: [LanguageStat!]!
    topFiles: [FileStat!]!
    dailyActivity: [DailyActivity!]!
    recentActivities: [ActivityLog!]!
    commits: [GitCommit!]!
  }

  type FileStat {
    filePath: String!
    duration: Int!
  }

  type Query {
    hello: String
    dashboardStats: DashboardStats!
    projects: [Project!]!
    project(id: ID!): Project
    projectDetails(id: ID!): ProjectDetails!
  }

  type Mutation {
    syncActivity(input: [ActivityInput!]!): SyncResponse!
    syncFileActivities(input: [FileActivityInput!]!): SyncResponse!
    syncCommits(input: [CommitInput!]!): SyncResponse!
    syncDailyStats(input: [DailyStatsInput!]!): SyncResponse!
  }
`;

const BigIntScalar = new GraphQLScalarType({
  name: "BigInt",
  description:
    "Custom BigInt scalar for Unix timestamps (millisecond precision)",
  serialize(value) {
    // Prisma BigInt → convert to JS number for JSON
    return Number(value);
  },
  parseValue(value) {
    // Input from client → convert to BigInt
    return BigInt(value as string | number);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) return BigInt(ast.value);
    return null;
  },
});

// =======================
// 2. Resolvers
// =======================

const resolvers = {
  BigInt: BigIntScalar,
  Query: {
    hello: () => "Hello from Miss-Minutes API",

    dashboardStats: async () => {
      const session = await getServerSession(authOptions);
      // @ts-expect-error - NextAuth session type
      if (!session?.user?.id) throw new Error("Unauthorized");

      // @ts-expect-error - NextAuth session type
      return ActivityController.getDashboardStats(session.user.id);
    },

    projects: async () => {
      const session = await getServerSession(authOptions);
      // @ts-expect-error - NextAuth session type
      if (!session?.user?.id) throw new Error("Unauthorized");

      // @ts-expect-error - NextAuth session type
      return ActivityController.getProjects(session.user.id);
    },

    project: async (_: any, { id }: { id: string }) => {
      const session = await getServerSession(authOptions);
      // @ts-expect-error - NextAuth session type
      if (!session?.user?.id) throw new Error("Unauthorized");

      // @ts-expect-error - NextAuth session type
      return ActivityController.getProject(session.user.id, id);
    },

    projectDetails: async (_: any, { id }: { id: string }) => {
      const session = await getServerSession(authOptions);
      // @ts-expect-error - NextAuth session type
      if (!session?.user?.id) throw new Error("Unauthorized");

      // @ts-expect-error - NextAuth session type
      return ActivityController.getProjectDetails(session.user.id, id);
    },
  },

  Mutation: {
    syncActivity: async (_: any, { input }: any, context: any) => {
      try {
        const token = context.request.headers
          ?.get("authorization")
          ?.replace("Bearer ", "");

        if (!token) throw new Error("Unauthorized");

        return await ActivityController.syncActivities(token, input);
      } catch (error) {
        console.error("[syncActivity] Error:", error);
        throw error;
      }
    },

    syncFileActivities: async (_: any, { input }: any, context: any) => {
      try {
        const token = context.request.headers
          ?.get("authorization")
          ?.replace("Bearer ", "");

        if (!token) throw new Error("Unauthorized");

        console.log(
          `[syncFileActivities] Processing ${input.length} file activities`
        );
        return await ActivityController.syncFileActivities(token, input);
      } catch (error) {
        console.error("[syncFileActivities] Error:", error);
        throw error;
      }
    },

    syncCommits: async (_: any, { input }: any, context: any) => {
      try {
        const token = context.request.headers
          ?.get("authorization")
          ?.replace("Bearer ", "");

        if (!token) throw new Error("Unauthorized");

        console.log(`[syncCommits] Processing ${input.length} commits`);
        return await ActivityController.syncCommits(token, input);
      } catch (error) {
        console.error("[syncCommits] Error:", error);
        throw error;
      }
    },

    syncDailyStats: async (_: any, { input }: any, context: any) => {
      try {
        const token = context.request.headers
          ?.get("authorization")
          ?.replace("Bearer ", "");

        if (!token) throw new Error("Unauthorized");

        return await ActivityController.syncDailyStats(token, input);
      } catch (error) {
        console.error("[syncDailyStats] Error:", error);
        throw error;
      }
    },
  },
};

const schema = createSchema({ typeDefs, resolvers });

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Request, Response },
});

// Wrapper to convert NextRequest → Yoga Request → NextResponse
async function handleYoga(req: NextRequest) {
  const request = new Request(req.url, {
    method: req.method,
    headers: req.headers,
    body: req.body,
    // @ts-expect-error - duplex is required for streaming
    duplex: "half",
  });

  const response = await yoga.handleRequest(request, {});

  return new NextResponse(await response.text(), {
    status: response.status,
    headers: response.headers,
  });
}

export async function GET(req: NextRequest) {
  return handleYoga(req);
}

export async function POST(req: NextRequest) {
  return handleYoga(req);
}
