import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <span className="numeric text-sm font-bold">Q</span>
      </span>
      <span className="text-base font-semibold tracking-tight text-foreground">Quicker</span>
    </Link>
  );
}

export function SiteHeader({ actions }: { actions?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Wordmark />
        <nav className="flex items-center gap-5 text-sm">
          <Link
            to="/demo"
            className="text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            Demo
          </Link>
          <Link
            to="/setup"
            className="text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            Setup
          </Link>
          {actions}
        </nav>
      </div>
    </header>
  );
}
