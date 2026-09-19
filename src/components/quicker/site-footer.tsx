import { Link } from "@tanstack/react-router";

const LEGAL_LINKS = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms of Service" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 text-xs text-muted-foreground">
        <span>Quicker — Gmail spend intelligence</span>
        <nav className="flex items-center gap-4">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <span>AI output can be inaccurate. Always check the source email.</span>
        </nav>
      </div>
    </footer>
  );
}
