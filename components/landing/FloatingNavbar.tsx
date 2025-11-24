"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ThemeToggle } from "../ThemeToggle";

export function FloatingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4 pointer-events-none">
      <nav
        className={cn(
          "pointer-events-auto flex items-center justify-between px-6 py-3 transition-all duration-300 ease-in-out",
          isScrolled
            ? "w-full max-w-2xl rounded-full bg-background/80 backdrop-blur-md border border-border shadow-lg"
            : "w-full max-w-6xl rounded-2xl bg-transparent border-transparent"
        )}
      >
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Image
            src="/logo.png"
            alt="Miss-Minutes"
            width={40}
            height={40}
            className="object-contain"
          />
          <span
            className={cn(isScrolled ? "text-destructive" : "text-destructive")}
          >
            Miss-Minutes
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <ThemeToggle />
          <Link
            href="#features"
            className="text-sm font-medium hover:text-primary transition-colors hidden md:block"
          >
            Features
          </Link>
          <Link
            href="#about"
            className="text-sm font-medium hover:text-primary transition-colors hidden md:block"
          >
            About
          </Link>
          <Link href="/api/auth/signin">
            <button
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md",
                isScrolled
                  ? "bg-foreground text-muted hover:bg-primary/90"
                  : "bg-muted text-foreground hover:bg-gray-100 dark:bg-gray-800 dark:text-white"
              )}
            >
              Get Started
            </button>
          </Link>
        </div>
      </nav>
    </div>
  );
}
