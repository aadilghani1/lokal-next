"use client";

import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/logo";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

export function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 flex h-[72px] items-center justify-between bg-background/60 px-4 backdrop-blur-lg md:px-12">
      <div className="flex items-center gap-2">
        <LogoMark className="size-7 text-primary" />
        <span className="font-heading text-lg font-bold tracking-tight">
          Lokal
        </span>
      </div>
      <div className="flex items-center gap-4">
        <a
          href="#how-it-works"
          className="hidden text-sm font-light text-muted-foreground hover:text-foreground sm:block"
        >
          How it works
        </a>
        <a href="/sign-in">
          <Button variant="ghost" size="sm">
            Sign in
          </Button>
        </a>
      </div>
    </nav>
  );
}
