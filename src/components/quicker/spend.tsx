import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export interface SpendItem {
  id: string;
  merchant: string;
  amount: number;
  currency: string;
  category: string;
  purchased_at: string | null;
  email_subject: string | null;
  email_from: string | null;
  gmail_message_id?: string | null;
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function money(amount: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="numeric mt-3 text-3xl text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function SpendStats({ items }: { items: SpendItem[] }) {
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const currency = items[0]?.currency ?? "USD";
  const merchants = new Set(items.map((i) => i.merchant)).size;
  const biggest = items.reduce<SpendItem | null>(
    (max, item) => (!max || item.amount > max.amount ? item : max),
    null,
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile label="Total tracked" value={money(total, currency)} hint={`${items.length} receipts`} />
      <StatTile
        label="Average receipt"
        value={money(items.length ? total / items.length : 0, currency)}
      />
      <StatTile label="Merchants" value={String(merchants)} />
      <StatTile
        label="Largest purchase"
        value={biggest ? money(biggest.amount, biggest.currency) : "—"}
        hint={biggest?.merchant}
      />
    </div>
  );
}

export function CategoryBreakdown({ items }: { items: SpendItem[] }) {
  const totals = new Map<string, number>();
  for (const item of items) {
    totals.set(item.category, (totals.get(item.category) ?? 0) + item.amount);
  }
  const data = [...totals.entries()]
    .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value);
  const currency = items[0]?.currency ?? "USD";
  const grand = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Where it goes</h3>
      <div className="mt-4 grid gap-6 sm:grid-cols-[180px_1fr] sm:items-center">
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={52} outerRadius={80} paddingAngle={3} stroke="none">
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  color: "var(--popover-foreground)",
                  fontSize: "12px",
                }}
                formatter={(value: number) => money(value, currency)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="space-y-2">
          {data.map((entry, index) => (
            <li key={entry.name} className="flex items-center gap-3 text-sm">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
              />
              <span className="flex-1 text-foreground">{entry.name}</span>
              <span className="numeric text-muted-foreground">
                {grand ? Math.round((entry.value / grand) * 100) : 0}%
              </span>
              <span className="numeric w-24 text-right text-foreground">
                {money(entry.value, currency)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function TransactionList({ items }: { items: SpendItem[] }) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h3 className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Receipts</h3>
        <span className="numeric text-xs text-muted-foreground">{items.length}</span>
      </div>
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center gap-3 px-6 py-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">{item.merchant}</p>
              <p className="truncate text-xs text-muted-foreground">
                {item.email_subject ?? item.email_from ?? "Receipt email"}
              </p>
            </div>
            <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
              {item.category}
            </span>
            <span className="numeric w-24 text-right text-xs text-muted-foreground">
              {item.purchased_at ?? "—"}
            </span>
            <span className="numeric w-28 text-right text-foreground">
              {money(item.amount, item.currency)}
            </span>
            {item.gmail_message_id ? (
              <a
                className="text-xs text-accent underline-offset-4 hover:underline"
                href={`https://mail.google.com/mail/u/0/#all/${item.gmail_message_id}`}
                target="_blank"
                rel="noreferrer"
              >
                source
              </a>
            ) : null}
          </li>
        ))}
        {items.length === 0 ? (
          <li className="px-6 py-10 text-center text-sm text-muted-foreground">
            Nothing here yet.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
