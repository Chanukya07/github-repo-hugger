import { useCallback, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Mail, RefreshCw, Unplug } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/quicker/site-header";
import { CategoryBreakdown, SpendStats, TransactionList } from "@/components/quicker/spend";
import {
  analyzeMailbox,
  completeMailboxConnection,
  disconnectMailbox,
  getMailboxStatus,
  listTransactions,
  startMailboxConnect,
} from "@/lib/gmail.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your spending — Quicker" },
      { name: "description", content: "Receipts from your inbox, turned into categorised spending." },
      { property: "og:title", content: "Your spending — Quicker" },
      { property: "og:description", content: "Your private Quicker spending dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function waitForOAuthCompletion(popup: Window) {
  return new Promise<string | null>((resolve, reject) => {
    let poll: number | undefined;
    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      if (poll !== undefined) window.clearInterval(poll);
    };
    const onMessage = (event: MessageEvent) => {
      const type = (event.data as { type?: string })?.type;
      if (
        event.origin !== window.location.origin ||
        event.source !== popup ||
        (event.data as { connectorId?: string })?.connectorId !== "google_mail" ||
        (type !== "appUserConnectorOAuthComplete" && type !== "appUserConnectorOAuthFailed")
      )
        return;
      cleanup();
      if (type === "appUserConnectorOAuthComplete") {
        const code = (event.data as { code?: string | null })?.code;
        resolve(typeof code === "string" ? code : null);
        return;
      }
      popup.close();
      reject(new Error("The Gmail connection was not completed."));
    };
    window.addEventListener("message", onMessage);
    poll = window.setInterval(() => {
      if (!popup.closed) return;
      cleanup();
      reject(new Error("The window closed before the connection finished."));
    }, 500);
  });
}

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [connecting, setConnecting] = useState(false);

  const fetchStatus = useServerFn(getMailboxStatus);
  const fetchTransactions = useServerFn(listTransactions);
  const startConnect = useServerFn(startMailboxConnect);
  const completeConnect = useServerFn(completeMailboxConnection);
  const runAnalyze = useServerFn(analyzeMailbox);
  const runDisconnect = useServerFn(disconnectMailbox);

  const status = useQuery({ queryKey: ["mailbox-status"], queryFn: () => fetchStatus() });
  const transactions = useQuery({
    queryKey: ["transactions"],
    queryFn: () => fetchTransactions(),
  });

  const analyze = useMutation({
    mutationFn: () => runAnalyze(),
    onSuccess: (result) => {
      if (result.reconnectRequired) {
        toast.error("Your Gmail access needs to be renewed.");
      } else {
        toast.success(`Read ${result.scanned} receipts, added ${result.imported} new ones.`);
      }
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["mailbox-status"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Analysis failed"),
  });

  const disconnect = useMutation({
    mutationFn: () => runDisconnect(),
    onSuccess: () => {
      toast.success("Gmail disconnected.");
      queryClient.invalidateQueries({ queryKey: ["mailbox-status"] });
    },
  });

  const connect = useCallback(async () => {
    setConnecting(true);
    const popup = window.open("", "quicker-gmail", "width=600,height=720");
    if (!popup) {
      setConnecting(false);
      toast.error("Allow pop-ups to connect Gmail.");
      return;
    }
    try {
      const { authorizationUrl } = await startConnect();
      const completion = waitForOAuthCompletion(popup);
      popup.location.href = authorizationUrl;
      const code = await completion;
      if (code) await completeConnect({ data: { code } });
      toast.success("Gmail connected.");
      await queryClient.invalidateQueries({ queryKey: ["mailbox-status"] });
    } catch (error) {
      popup.close();
      toast.error(error instanceof Error ? error.message : "Could not connect Gmail");
    } finally {
      setConnecting(false);
    }
  }, [completeConnect, queryClient, startConnect]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const items = transactions.data ?? [];
  const connected = status.data?.connected === true;
  const reconnect = status.data?.reconnectRequired === true;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        actions={
          <button
            type="button"
            onClick={signOut}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign out
          </button>
        }
      />
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Your spending
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
              Receipt intelligence
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {connected ? (
              <>
                <button
                  type="button"
                  onClick={() => analyze.mutate()}
                  disabled={analyze.isPending}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {analyze.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Analyse inbox
                </button>
                <button
                  type="button"
                  onClick={() => disconnect.mutate()}
                  disabled={disconnect.isPending}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Unplug className="h-4 w-4" /> Disconnect
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={connect}
                disabled={connecting}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {connecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {reconnect ? "Reconnect Gmail" : "Connect Gmail"}
              </button>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card px-6 py-4 text-sm">
          {status.isPending ? (
            <span className="text-muted-foreground">Checking your mailbox…</span>
          ) : connected ? (
            <span className="text-muted-foreground">
              Connected to{" "}
              <span className="text-foreground">{status.data?.emailAddress ?? "Gmail"}</span> —
              read-only. Each run reads up to 15 receipt emails from the last year.
            </span>
          ) : reconnect ? (
            <span className="text-muted-foreground">
              Your Gmail access needs to be renewed before the next analysis.
            </span>
          ) : (
            <span className="text-muted-foreground">
              Connect Gmail with read-only access to build your ledger. Quicker can never send or
              delete mail. Connection trouble? See the{" "}
              <Link to="/setup" className="text-primary underline-offset-4 hover:underline">
                setup checklist
              </Link>
              .
            </span>
          )}
        </div>

        {items.length > 0 ? (
          <>
            <SpendStats items={items} />
            <CategoryBreakdown items={items} />
            <TransactionList items={items} />
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <p className="text-lg font-medium text-foreground">No receipts yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {connected
                ? "Run an analysis to pull receipts from your inbox."
                : "Connect Gmail to get started, or browse the sample dashboard."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
