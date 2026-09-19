import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/quicker/site-header";
import { CategoryBreakdown, SpendStats, TransactionList } from "@/components/quicker/spend";
import { sampleTransactions } from "@/lib/sample-data";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Quicker demo — a sample spending dashboard" },
      {
        name: "description",
        content:
          "Explore Quicker with bundled sample receipts. No Gmail connection and no account required.",
      },
      { property: "og:title", content: "Quicker demo — a sample spending dashboard" },
      {
        property: "og:description",
        content: "See how Quicker turns receipt emails into categorised spending, using sample data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Demo,
});

function Demo() {
  const items = sampleTransactions.map((t) => ({ ...t, gmail_message_id: null }));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        actions={
          <Link
            to="/auth"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Use my inbox
          </Link>
        }
      />
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-12">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Sample data</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
            This is what a connected inbox looks like
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Nothing here touches Gmail — these are bundled example receipts so you can judge the
            product before granting access.
          </p>
        </div>
        <SpendStats items={items} />
        <CategoryBreakdown items={items} />
        <TransactionList items={items} />
      </main>
    </div>
  );
}
