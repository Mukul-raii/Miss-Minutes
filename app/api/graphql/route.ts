// @ts-nocheck
//Todo to remove above line after fixing all ts errors
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSchema, createYoga } from "graphql-yoga";
import { ActivityController } from "@/lib/controllers/activity";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

/* 
-> Auth for  extension api requests with apiToken
-> Api that accepts activity logs from the client and stores them in the database
-> Showcase the user activity with dashboard , project basis , language basis 
*/

const typeDefs = `
  type ActivityLog {
    id: ID!
    projectPath: String!
    filePath: String!
    language: String!
    timestamp: Float!
    duration: Int!
  }

  input ActivityInput {
    projectPath: String!
    filePath: String!
    language: String!
    timestamp: Float!
    duration: Int!
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

const resolvers = {
  Query: {
    hello: () => "Hello from CodeChrono API",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    dashboardStats: async (_: any, __: any, ___: any) => {
      // For GraphQL requests from the frontend, we need to get the session
      // Note: getServerSession might not work directly inside Yoga context without passing request/response correctly
      // But since this is a Route Handler, we can try.
      // Alternatively, we can rely on the context if we pass it.

      // In a real app, we'd extract the user from the session here.
      // For now, let's assume the user ID is passed in a header or we mock it if not found (for dev).
      // Ideally: const session = await getServerSession(authOptions);

      // WORKAROUND: Since getServerSession needs headers/cookies which might be tricky in Yoga's request object wrapper,
      // we will try to get it. If not, we throw.

      // For this iteration, let's assume the client sends 'x-user-id' header for simplicity if session fails,
      // OR we can try to use the session.

      // Let's try to get the session.
      // Note: In Next.js App Router, getServerSession requires the standard Request/Response or nothing (for server components).
      // Inside a Route Handler (POST/GET), it should work.

      const session = await getServerSession(authOptions);
      if (!session?.user) {
        throw new Error("Unauthorized");
      }

      // @ts-expect-error - user id
      return ActivityController.getDashboardStats(session.user.id);
    },
  },
  Mutation: {
    syncActivity: async (_: any, { input }: { input: any[] }, context: any) => {
      const token = context.request.headers
        .get("authorization")
        ?.replace("Bearer ", "");
      console.log("Received token:", token);
      if (!token) {
        throw new Error("Unauthorized");
      }

      return ActivityController.syncActivities(token, input);
    },
  },
};

const schema = createSchema({
  typeDefs,
  resolvers,
});

const { handleRequest } = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response },
});

export { handleRequest as GET, handleRequest as POST };
