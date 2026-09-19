import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Lock, Mail, Sparkles, Receipt } from "lucide-react";
import { SiteHeader } from "@/components/quicker/site-header";
import { SiteFooter } from "@/components/quicker/site-footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quicker — spending intelligence from your inbox" },
      {
        name: "description",
        content:
          "Quicker reads receipt emails with read-only Gmail access and turns them into a clear picture of what you actually spend.",
      },
      { property: "og:title", content: "Quicker — spending intelligence from your inbox" },
      {
        property: "og:description",
        content:
          "Connect Gmail read-only and Quicker turns receipts and invoices into structured spending you can see at a glance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const steps = [
  {
    icon: Mail,
    title: "Connect Gmail, read-only",
    body: "Quicker can only read. It can never send, edit or delete an email in your mailbox.",
  },
  {
    icon: Receipt,
    title: "Find the receipts",
    body: "It looks for receipts, invoices and order confirmations from the last year — nothing else.",
  },
  {
    icon: Sparkles,
    title: "Turn them into numbers",
    body: "Sender, subject and a short preview go to the AI, which returns merchant, amount and category.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        actions={
          <Link
            to="/auth"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Sign in
          </Link>
        }
      />

      <section className="relative overflow-hidden">
        <div className="surface-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 sm:pt-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Gmail read-only · nothing stored without you
          </span>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-7xl">
            Your receipts already know
            <span className="text-signal"> where the money went.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Quicker reads the receipts sitting in your inbox and turns them into a clean ledger —
            merchant, amount, category, and a link back to the original email.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Analyse my inbox <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              See the sample dashboard
            </Link>
          </div>

          <div className="glow-ring mt-16 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-5 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-chart-3/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
              <span className="ml-3 numeric text-xs text-muted-foreground">
                quicker · last 12 months
              </span>
            </div>
            <div className="grid gap-px bg-border sm:grid-cols-3">
              {[
                { k: "Tracked", v: "$2,036.34" },
                { k: "Receipts read", v: "15" },
                { k: "Top category", v: "Travel" },
              ].map((cell) => (
                <div key={cell.k} className="bg-card px-6 py-7">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {cell.k}
                  </p>
                  <p className="numeric mt-2 text-2xl text-foreground">{cell.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title} className="rounded-xl border border-border bg-card p-6">
              <step.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-4 text-lg font-medium text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-12">
          <Lock className="h-5 w-5 text-accent" />
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            Read-only, and deliberately narrow
          </h2>
          <ul className="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <li>· Only receipt-like emails from the last year are opened — at most 15 per run.</li>
            <li>· Only sender, subject, date and a short preview are analysed.</li>
            <li>· Your mailbox access can be disconnected from the dashboard at any time.</li>
            <li>· Every result links back to its email so you can verify it yourself.</li>
          </ul>
          <Link
            to="/auth"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
