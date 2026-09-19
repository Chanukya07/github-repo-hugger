import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, KeyRound, Zap, AlertTriangle, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/quicker/site-header";
import { SiteFooter } from "@/components/quicker/site-footer";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Quicker" },
      {
        name: "description",
        content:
          "The terms under which you use Quicker, including your responsibilities and the limits of AI-generated spending data.",
      },
      { property: "og:title", content: "Terms of Service — Quicker" },
      {
        property: "og:description",
        content:
          "Your responsibilities when using Quicker and the limits of AI-extracted spending data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsOfService,
});

const LAST_UPDATED = "September 19, 2026";

const SECTIONS = [
  {
    icon: FileText,
    title: "1. What Quicker does",
    body: "Quicker is a personal spending intelligence tool. It connects to your Gmail with read-only access, finds receipt-like emails, and uses AI to extract merchant, amount, and category into a structured ledger you can review. It is not accounting software, not a payment processor, and not financial advice.",
  },
  {
    icon: KeyRound,
    title: "2. Your account and access",
    body: "You are responsible for keeping your sign-in credentials secure and for all activity under your account. You grant Quicker read-only access to your mailbox solely for the purpose of finding receipts. You may disconnect Gmail or delete your data at any time from your dashboard.",
  },
  {
    icon: Zap,
    title: "3. Acceptable use",
    body: "You agree to use Quicker only for your own mailbox and not to attempt to access another person's email, reverse-engineer the service, or overload its systems. You must not use Quicker in violation of applicable law or Google's terms of service.",
  },
  {
    icon: AlertTriangle,
    title: "4. AI accuracy and your responsibility",
    body: "Spending data is extracted by an AI model from email metadata. Results can be wrong — a merchant may be mislabelled, an amount misread, or a category mistaken. Every transaction links back to its source email so you can verify it. You are responsible for checking any figure before relying on it for budgeting, taxes, or reporting.",
  },
  {
    icon: AlertTriangle,
    title: "5. No warranty",
    body: "Quicker is provided 'as is' without warranty of any kind. We do not guarantee that the service will be uninterrupted, error-free, or that every receipt will be found or correctly categorised. To the maximum extent permitted by law, Quicker is not liable for any loss arising from inaccurate spending data or service downtime.",
  },
  {
    icon: FileText,
    title: "6. Changes and contact",
    body: "We may update these terms as the service evolves; material changes will be reflected in the 'last updated' date above. Continued use after a change means you accept the revised terms. For questions about these terms, disconnect your mailbox first if your concern involves account data.",
  },
];

function TermsOfService() {
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
          Terms of Service
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          These terms govern your use of Quicker. By signing in and connecting a mailbox, you
          accept them. Please read the AI-accuracy section in particular — extracted spending data
          can be wrong, and you are responsible for checking it.
        </p>

        <div className="mt-12 space-y-6">
          {SECTIONS.map((section) => (
            <section
              key={section.title}
              className="rounded-xl border border-border bg-card p-6"
            >
              <section.icon className="h-5 w-5 text-primary" />
              <h2 className="mt-4 text-lg font-medium text-foreground">{section.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </div>

        <section className="mt-12 rounded-2xl border border-border bg-card p-8">
          <AlertTriangle className="h-5 w-5 text-accent" />
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
            The short version
          </h2>
          <ul className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <li>· Use Quicker only on your own mailbox.</li>
            <li>· AI-extracted figures can be wrong — verify before relying on them.</li>
            <li>· Disconnect or delete your data whenever you want.</li>
            <li>· The service is provided as-is, with no warranty.</li>
          </ul>
          <Link
            to="/privacy"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Read the Privacy Policy <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
