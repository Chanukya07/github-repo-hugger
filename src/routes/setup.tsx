import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, CheckCircle2, Copy, ExternalLink, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getMailboxStatus } from "@/lib/gmail.functions";
import { SiteHeader } from "@/components/quicker/site-header";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Setup checklist — Quicker" },
      {
        name: "description",
        content:
          "Configure the Google OAuth redirect URI and verify your Gmail connection for Quicker.",
      },
      { property: "og:title", content: "Setup checklist — Quicker" },
      {
        property: "og:description",
        content: "Get Gmail receipt scanning running in four steps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Setup,
});

const REDIRECT_URI = "https://connector-gateway.lovable.dev/api/v1/app-users/oauth2/callback";
const GOOGLE_CONSOLE_URL = "https://console.cloud.google.com/apis/credentials";

const STEPS = [
  {
    title: "Open your Google OAuth client",
    body: (
      <>
        In the{" "}
        <a
          href={GOOGLE_CONSOLE_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
        >
          Google Cloud credentials console <ExternalLink className="h-3 w-3" />
        </a>
        , open the OAuth 2.0 web client that backs this app's Gmail connection.
      </>
    ),
  },
  {
    title: "Add the authorised redirect URI",
    body: (
      <>
        Under <span className="text-foreground">Authorised redirect URIs</span>, add the Lovable
        connector gateway callback below, then save. This is the only callback Google needs — do not
        add your app's own URL.
      </>
    ),
  },
  {
    title: "Check the Gmail scope",
    body: (
      <>
        On the OAuth consent screen, make sure{" "}
        <code className="numeric rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
          .../auth/gmail.readonly
        </code>{" "}
        is listed as a scope. Quicker only ever reads mail — it can never send or delete.
      </>
    ),
  },
  {
    title: "Connect and verify",
    body: (
      <>
        Sign in, connect Gmail from your dashboard, then come back here and run the verification
        below. A green result means receipts can be scanned.
      </>
    ),
  },
];

function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
      <code className="numeric flex-1 truncate text-xs text-foreground">{value}</code>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            toast.error("Could not copy — select the text manually.");
          }
        }}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

type VerifyState =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "ok"; email: string | null }
  | { kind: "not-connected" }
  | { kind: "reconnect" }
  | { kind: "error"; message: string };

function Setup() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [verify, setVerify] = useState<VerifyState>({ kind: "idle" });
  const fetchStatus = useServerFn(getMailboxStatus);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setSignedIn(Boolean(data.session));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function runVerify() {
    setVerify({ kind: "checking" });
    try {
      const status = await fetchStatus();
      if (!status.connected) {
        setVerify(
          status.reconnectRequired ? { kind: "reconnect" } : { kind: "not-connected" },
        );
      } else {
        setVerify({ kind: "ok", email: status.emailAddress ?? null });
      }
    } catch (error) {
      setVerify({
        kind: "error",
        message: error instanceof Error ? error.message : "Verification failed",
      });
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        actions={
          <Link
            to="/dashboard"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
        }
      />
      <main className="mx-auto max-w-3xl space-y-10 px-6 py-12">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Setup checklist
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
            Get Gmail scanning running
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            One-time configuration so Google lets Quicker read receipts from your inbox. Four
            steps, then verify.
          </p>
        </div>

        <ol className="space-y-4">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-xl border border-border bg-card p-5"
            >
              <span className="numeric flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-sm font-semibold text-primary">
                {index + 1}
              </span>
              <div className="text-sm">
                <p className="font-semibold text-foreground">{step.title}</p>
                <p className="mt-1.5 leading-relaxed text-muted-foreground">{step.body}</p>
                {index === 1 && <CopyField value={REDIRECT_URI} />}
              </div>
            </li>
          ))}
        </ol>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Verify your connection
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Checks that your account has a working, read-only Gmail connection.
          </p>

          <div className="mt-5">
            {signedIn === false ? (
              <p className="text-sm text-muted-foreground">
                <Link to="/auth" className="text-primary underline-offset-4 hover:underline">
                  Sign in
                </Link>{" "}
                first, then run the check.
              </p>
            ) : (
              <button
                type="button"
                onClick={runVerify}
                disabled={verify.kind === "checking" || signedIn !== true}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {verify.kind === "checking" && <Loader2 className="h-4 w-4 animate-spin" />}
                Run verification
              </button>
            )}

            {verify.kind === "ok" && (
              <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2.5 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Connected{verify.email ? ` to ${verify.email}` : ""}. Receipt scanning is ready.
              </p>
            )}
            {verify.kind === "not-connected" && (
              <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-muted-foreground">
                <XCircle className="h-4 w-4" />
                No Gmail connection yet.{" "}
                <Link to="/dashboard" className="text-primary underline-offset-4 hover:underline">
                  Connect it on your dashboard
                </Link>
                .
              </p>
            )}
            {verify.kind === "reconnect" && (
              <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-muted-foreground">
                <XCircle className="h-4 w-4" />
                Your Gmail access needs renewing — reconnect from your dashboard.
              </p>
            )}
            {verify.kind === "error" && (
              <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm text-foreground">
                <XCircle className="h-4 w-4 text-destructive" />
                {verify.message}
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
