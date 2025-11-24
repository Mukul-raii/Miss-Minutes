import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Download } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="container px-4 mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-8">
              <span className="flex w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              v1.0 is now live
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-8 leading-tight">
              Track Your Coding Time. <br />
              <span className="text-primary relative inline-block">
                with No Limts.
                <svg
                  className="absolute w-full h-3 -bottom-1 left-0 text-accent/30"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 5 Q 50 10 100 5"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              A developer-first activity tracker that logs every file, every
              project, every commit — with zero effort.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="https://marketplace.visualstudio.com/items?itemName=Mukulrai.miss-minutes"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Install Extension
              </Link>
              <Link
                href="/api/auth/signin"
                className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-foreground bg-card border border-border rounded-xl hover:bg-muted/50 transition-all flex items-center justify-center gap-2"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative flex flex-col items-center gap-8">
            <div className="relative w-full max-w-[500px] aspect-square">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl -z-10 transform translate-y-10"></div>
              <Image
                src="/marvel-miss-minutes-pack.png"
                alt="Miss-Minutes Tracking"
                fill
                className="object-cover drop-shadow-2xl hover:scale-105 transition-transform duration-500 object-left"
                priority
              />
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>No manual timers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Private by design</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>VS Code Extension</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
    </section>
  );
}
