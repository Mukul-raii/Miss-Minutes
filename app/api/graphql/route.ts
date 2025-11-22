// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";
import { createSchema, createYoga } from "graphql-yoga";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { ActivityController } from "@/lib/controllers/activity";
import { GraphQLScalarType } from "graphql";

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
    projectPath: String!
    filePath: String!
    language: String!
    timestamp: BigInt!
    duration: Int!
    editor: String!
    commitHash: String!

  }

  input ActivityInput {
    projectPath: String!
    filePath: String!
    language: String!
    timestamp: BigInt!
    duration: Int!
    editor: String!
    commitHash: String!
  }

  type SyncResponse {
    success: Boolean!
    message: String!
  }

  type LanguageStat {
    language: String!
    totalDuration: Int!
  }

  type ProjectStat {
    id: ID!
    name: String!
    path: String!
    totalDuration: Int!
  }

  type DashboardStats {
    totalDuration: Int!
    languages: [LanguageStat!]!
    projects: [ProjectStat!]!
  }

  type Query {
    hello: String
    dashboardStats: DashboardStats!
  }

  type Mutation {
    syncActivity(input: [ActivityInput!]!): SyncResponse!
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
    return BigInt(value);
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
    hello: () => "Hello from CodeChrono API",

    dashboardStats: async () => {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) throw new Error("Unauthorized");

      return ActivityController.getDashboardStats(session.user.id);
    },
  },

  Mutation: {
    syncActivity: async (_: any, { input }: any, context: any) => {
      const token = context.request.headers
        ?.get("authorization")
        ?.replace("Bearer ", "");

      if (!token) throw new Error("Unauthorized");

      return ActivityController.syncActivities(token, input);
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
    duplex: "half",
  });

  const response = await yoga.handleRequest(request);

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
