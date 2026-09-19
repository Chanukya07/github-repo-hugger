import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY_BASE_URL = "https://connector-gateway.lovable.dev";
const CONNECTOR_ID = "google_mail";
const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/gmail.readonly",
];

export interface MailboxStatus {
  connected: boolean;
  reconnectRequired?: boolean;
  emailAddress?: string;
}

export const getMailboxStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MailboxStatus> => {
    const { getConnectionKeyForUser } = await import("@/server/appUserConnections.server");
    const { callAsAppUser, appUserReconnectRequired } = await import(
      "@/integrations/lovable/appUserConnector"
    );
    const connectionAPIKey = await getConnectionKeyForUser(context.userId, CONNECTOR_ID);
    if (!connectionAPIKey) return { connected: false };

    const res = await callAsAppUser({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectionAPIKey,
      connectorId: CONNECTOR_ID,
      path: "/gmail/v1/users/me/profile",
      requiredScopes: GOOGLE_SCOPES,
    });
    if (await appUserReconnectRequired(res)) return { connected: false, reconnectRequired: true };
    if (!res.ok) {
      console.error("Gmail profile lookup failed", res.status, await res.text());
      return { connected: false };
    }
    const profile = (await res.json()) as { emailAddress?: string };
    return { connected: true, emailAddress: profile.emailAddress };
  });

export const startMailboxConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const clientAPIKey = process.env["GOOGLE_MAIL_APP_USER_CONNECTOR_CLIENT_API_KEY"];
    if (!clientAPIKey) throw new Error("Gmail connector client is not configured");

    const request = getRequest();
    if (!request) throw new Error("Connecting must start from an app request.");
    const url = new URL(request.url);
    const sandboxHost =
      url.hostname === "localhost" ? request.headers.get("x-forwarded-host") : null;
    const returnUrl = new URL(
      "/oauth/google-mail/return",
      sandboxHost ? `https://${sandboxHost}` : url.origin,
    ).toString();

    const { getConnectionKeyForUser } = await import("@/server/appUserConnections.server");
    const { authorizeAppUserOAuth } = await import("@/integrations/lovable/appUserConnector");
    const existing = await getConnectionKeyForUser(context.userId, CONNECTOR_ID);

    const { authorizationUrl } = await authorizeAppUserOAuth({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectorId: CONNECTOR_ID,
      appUserId: context.userId,
      clientAPIKey,
      returnUrl,
      connectionAPIKey: existing ?? undefined,
      credentialsConfiguration: { scopes: GOOGLE_SCOPES },
    });
    return { authorizationUrl };
  });

export const completeMailboxConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { code: string }) => input)
  .handler(async ({ data, context }) => {
    const { exchangeAppUserOAuthCode } = await import("@/integrations/lovable/appUserConnector");
    const { saveConnectionKeyForUser } = await import("@/server/appUserConnections.server");
    const { connectionAPIKey, connectorId } = await exchangeAppUserOAuthCode(
      GATEWAY_BASE_URL,
      data.code,
    );
    if (connectorId !== CONNECTOR_ID) throw new Error("Connection returned the wrong service");
    await saveConnectionKeyForUser(context.userId, connectorId, connectionAPIKey);
    return { ok: true };
  });

export const disconnectMailbox = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getConnectionKeyForUser, deleteConnectionForUser } = await import(
      "@/server/appUserConnections.server"
    );
    const { disconnectAppUser } = await import("@/integrations/lovable/appUserConnector");
    const connectionAPIKey = await getConnectionKeyForUser(context.userId, CONNECTOR_ID);
    if (connectionAPIKey) {
      try {
        await disconnectAppUser({
          gatewayBaseUrl: GATEWAY_BASE_URL,
          connectionAPIKey,
          connectorId: CONNECTOR_ID,
        });
      } catch (error) {
        console.error("Gateway disconnect failed", error);
      }
    }
    await deleteConnectionForUser(context.userId, CONNECTOR_ID);
    return { ok: true };
  });

export interface TransactionRow {
  id: string;
  merchant: string;
  amount: number;
  currency: string;
  category: string;
  purchased_at: string | null;
  email_subject: string | null;
  email_from: string | null;
  gmail_message_id: string | null;
}

export const listTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TransactionRow[]> => {
    const { data, error } = await context.supabase
      .from("transactions")
      .select(
        "id, merchant, amount, currency, category, purchased_at, email_subject, email_from, gmail_message_id",
      )
      .order("purchased_at", { ascending: false, nullsFirst: false })
      .limit(200);
    if (error) throw error;
    return (data ?? []).map((row) => ({ ...row, amount: Number(row.amount) }));
  });

interface ExtractedTransaction {
  merchant: string;
  amount: number;
  currency: string;
  category: string;
  purchased_at: string | null;
  gmail_message_id: string;
  confidence: number;
}

async function extractWithAI(
  messages: { id: string; from: string; subject: string; date: string; snippet: string }[],
): Promise<ExtractedTransaction[]> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3.8-flash",
      messages: [
        {
          role: "system",
          content:
            "You turn receipt email metadata into structured spending records. Only return real purchases. " +
            'Reply with JSON only: {"transactions":[{"gmail_message_id":string,"merchant":string,"amount":number,' +
            '"currency":string(ISO code),"category":one of ["Food","Shopping","Travel","Subscriptions","Utilities","Health","Entertainment","Other"],' +
            '"purchased_at":"YYYY-MM-DD"|null,"confidence":number between 0 and 1}]}. ' +
            "Skip promotional or non-purchase emails entirely. Never invent amounts you cannot infer.",
        },
        { role: "user", content: JSON.stringify(messages) },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("AI gateway error", res.status, body);
    if (res.status === 429) throw new Error("Too many requests right now — try again in a minute.");
    if (res.status === 402) throw new Error("AI credits are exhausted for this workspace.");
    throw new Error("Could not analyse the receipts right now.");
  }

  const payload = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = payload.choices?.[0]?.message?.content ?? "";
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return [];
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1)) as {
      transactions?: ExtractedTransaction[];
    };
    return Array.isArray(parsed.transactions) ? parsed.transactions : [];
  } catch {
    return [];
  }
}

export const analyzeMailbox = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getConnectionKeyForUser } = await import("@/server/appUserConnections.server");
    const { callAsAppUser, appUserReconnectRequired } = await import(
      "@/integrations/lovable/appUserConnector"
    );
    const connectionAPIKey = await getConnectionKeyForUser(context.userId, CONNECTOR_ID);
    if (!connectionAPIKey) return { connected: false as const, imported: 0, scanned: 0 };

    const query =
      "newer_than:1y (receipt OR invoice OR \"order confirmation\" OR \"payment received\" OR \"your order\")";
    const listRes = await callAsAppUser({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectionAPIKey,
      connectorId: CONNECTOR_ID,
      path: `/gmail/v1/users/me/messages?maxResults=15&q=${encodeURIComponent(query)}`,
      requiredScopes: GOOGLE_SCOPES,
    });
    if (await appUserReconnectRequired(listRes)) {
      return { connected: false as const, reconnectRequired: true, imported: 0, scanned: 0 };
    }
    if (!listRes.ok) {
      console.error("Gmail search failed", listRes.status, await listRes.text());
      throw new Error("Could not read the mailbox right now.");
    }
    const list = (await listRes.json()) as { messages?: { id: string }[] };
    const ids = (list.messages ?? []).map((m) => m.id).slice(0, 15);

    const details = await Promise.all(
      ids.map(async (id) => {
        const res = await callAsAppUser({
          gatewayBaseUrl: GATEWAY_BASE_URL,
          connectionAPIKey,
          connectorId: CONNECTOR_ID,
          path: `/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
          requiredScopes: GOOGLE_SCOPES,
        });
        if (!res.ok) return null;
        const msg = (await res.json()) as {
          snippet?: string;
          payload?: { headers?: { name: string; value: string }[] };
        };
        const header = (name: string) =>
          msg.payload?.headers?.find((h) => h.name.toLowerCase() === name)?.value ?? "";
        return {
          id,
          from: header("from"),
          subject: header("subject"),
          date: header("date"),
          snippet: (msg.snippet ?? "").slice(0, 400),
        };
      }),
    );

    const messages = details.filter((m): m is NonNullable<typeof m> => m !== null);
    if (messages.length === 0) return { connected: true as const, imported: 0, scanned: 0 };

    const extracted = await extractWithAI(messages);
    const byId = new Map(messages.map((m) => [m.id, m]));

    const rows = extracted
      .filter((t) => t && t.merchant && Number.isFinite(Number(t.amount)))
      .map((t) => {
        const source = byId.get(t.gmail_message_id);
        return {
          user_id: context.userId,
          merchant: String(t.merchant).slice(0, 120),
          amount: Number(t.amount),
          currency: (t.currency || "USD").slice(0, 8).toUpperCase(),
          category: t.category || "Other",
          purchased_at: t.purchased_at,
          email_subject: source?.subject ?? null,
          email_from: source?.from ?? null,
          gmail_message_id: t.gmail_message_id ?? null,
          confidence: typeof t.confidence === "number" ? Math.min(1, Math.max(0, t.confidence)) : null,
        };
      });

    if (rows.length > 0) {
      const { error } = await context.supabase
        .from("transactions")
        .upsert(rows, { onConflict: "user_id,gmail_message_id", ignoreDuplicates: true });
      if (error) throw error;
    }

    return { connected: true as const, imported: rows.length, scanned: messages.length };
  });
