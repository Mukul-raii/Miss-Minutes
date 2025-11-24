"use client";

import { signIn } from "next-auth/react";
import { Github, Code, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SignIn() {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2">
      {/* Left Side - Image */}
      <div className="relative hidden lg:flex flex-col items-center justify-center bg-muted p-12 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 w-full max-w-[500px] aspect-square">
          <Image
            src="/marvel-miss-minutes-pack.png"
            alt="Miss-Minutes Tracking"
            fill
            className="object-cover scale-x-[-1] drop-shadow-2xl duration-500 object-right "
            priority
          />
        </div>

        <div className="relative z-10 mt-8 text-center max-w-md">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Track time, not distractions.
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of developers who trust Miss-Minutes for their
            productivity insights.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-background to-secondary/20 relative">
        <div className="absolute top-8 left-8 lg:hidden">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>

        <div className="absolute top-8 right-8 hidden lg:block">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center text-center space-y-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="p-3 rounded-xl bg-primary/10 group-hover:scale-110 transition-transform">
                <Code className="w-8 h-8 text-primary" />
              </div>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="text-muted-foreground">
              Sign in to your account to continue tracking your coding journey.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm border border-gray-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">
                  or
                </span>
              </div>
            </div>

            <button
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#24292F] text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-sm"
            >
              <Github className="w-5 h-5" />
              Sign in with GitHub
            </button>
          </div>

          <div className="pt-6 text-center text-sm text-muted-foreground">
            <p>
              By clicking continue, you agree to our{" "}
              <Link href="#" className="underline hover:text-primary">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="underline hover:text-primary">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
