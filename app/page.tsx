import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

import { FloatingNavbar } from "@/components/landing/FloatingNavbar";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-background text-foreground relative">
      <FloatingNavbar />
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold text-foreground">
          Welcome to{" "}
          <span className="text-primary">
            CodeChrono
          </span>
        </h1>

        <p className="mt-3 text-2xl text-muted-foreground">
          Track your coding activity effortlessly.
        </p>

        <div className="mt-8">
          <Link
            href="/api/auth/signin"
            className="px-8 py-3 text-lg font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          <div className="p-6 bg-card text-card-foreground rounded-xl shadow-md border border-border">
            <h3 className="text-xl font-bold mb-2">
              Real-time Tracking
            </h3>
            <p className="text-muted-foreground">
              Automatically track your coding time directly from VS Code.
            </p>
          </div>
          <div className="p-6 bg-card text-card-foreground rounded-xl shadow-md border border-border">
            <h3 className="text-xl font-bold mb-2">
              Detailed Insights
            </h3>
            <p className="text-muted-foreground">
              Visualize your productivity with charts and detailed reports.
            </p>
          </div>
          <div className="p-6 bg-card text-card-foreground rounded-xl shadow-md border border-border">
            <h3 className="text-xl font-bold mb-2">
              Offline Support
            </h3>
            <p className="text-muted-foreground">
              Keep tracking even when you&apos;re offline. Data syncs
              automatically.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
