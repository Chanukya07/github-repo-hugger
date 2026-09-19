import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Lock, Mail, Eye, Trash2, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/quicker/site-header";
import { SiteFooter } from "@/components/quicker/site-footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Quicker" },
      {
        name: "description",
        content:
          "How Quicker handles your Gmail access, receipt data, and account information.",
      },
      { property: "og:title", content: "Privacy Policy — Quicker" },
      {
        property: "og:description",
        content:
          "Quicker reads receipts with read-only Gmail access. Here is exactly what we keep and what we don't.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPolicy,
});

const LAST_UPDATED = "September 19, 2026";

const POINTS = [
  {
    icon: Mail,
    title: "What we read",
    body: "When you connect Gmail, Quicker searches for receipt-like emails from the last year — invoices, order confirmations, payment notices. It opens at most 15 of these per analysis run. It does not read, index, or store any other mail.",
  },
  {
    icon: Eye,
    title: "What we send to AI",
    body: "For each matching email, only the sender address, subject line, date, and a short snippet are passed to our AI provider to extract merchant, amount, and category. Full message bodies are never sent.",
  },
  {
    icon: Lock,
    title: "What we store",
    body: "We save the extracted spending record — merchant, amount, currency, category, date, and a link back to the source email — so you can see your ledger later. We do not store your Gmail message contents, only the metadata we extracted.",
  },
  {
    icon: Shield,
    title: "Your Gmail access",
    body: "Quicker uses Gmail's read-only scope. It can never send, edit, or delete email. Your access token is used only during an analysis run and the connection is encrypted at rest. You can disconnect Gmail at any time from your dashboard.",
  },
  {
    icon: Trash2,
    title: "Deleting your data",
    body: "Sign in, go to your dashboard, and disconnect Gmail — your stored connection is removed. You can also delete individual transactions or contact us to erase your account and all associated spending records.",
  },
];

function PrivacyPolicy() {
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

      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Last updated {LAST_UPDATED}
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
          Privacy Policy
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Quicker turns the receipts sitting in your inbox into a clear spending ledger. This
          policy explains exactly what we access, what we keep, and how to remove it.
        </p>

        <div className="mt-12 space-y-6">
          {POINTS.map((point) => (
            <section
              key={point.title}
              className="rounded-xl border border-border bg-card p-6"
            >
              <point.icon className="h-5 w-5 text-primary" />
              <h2 className="mt-4 text-lg font-medium text-foreground">{point.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{point.body}</p>
            </section>
          ))}
        </div>

        <section className="mt-12 rounded-2xl border border-border bg-card p-8">
          <Lock className="h-5 w-5 text-accent" />
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
            In short
          </h2>
          <ul className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <li>· Read-only Gmail access — never send, edit, or delete.</li>
            <li>· Only receipt-like emails are opened, at most 15 per run.</li>
            <li>· Only metadata goes to AI, never full message bodies.</li>
            <li>· Disconnect or delete everything whenever you want.</li>
          </ul>
          <Link
            to="/terms"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Read the Terms of Service <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
