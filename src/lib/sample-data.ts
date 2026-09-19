export interface SampleTransaction {
  id: string;
  merchant: string;
  amount: number;
  currency: string;
  category: string;
  purchased_at: string;
  email_subject: string;
  email_from: string;
}

export const sampleTransactions: SampleTransaction[] = [
  { id: "s1", merchant: "Blue Bottle Coffee", amount: 18.4, currency: "USD", category: "Food", purchased_at: "2026-09-14", email_subject: "Your Blue Bottle receipt", email_from: "receipts@bluebottle.com" },
  { id: "s2", merchant: "Notion Labs", amount: 20, currency: "USD", category: "Subscriptions", purchased_at: "2026-09-12", email_subject: "Notion invoice — September", email_from: "billing@notion.so" },
  { id: "s3", merchant: "Uber", amount: 26.75, currency: "USD", category: "Travel", purchased_at: "2026-09-11", email_subject: "Your Thursday evening trip", email_from: "receipts@uber.com" },
  { id: "s4", merchant: "Apple", amount: 1299, currency: "USD", category: "Shopping", purchased_at: "2026-09-08", email_subject: "Your Apple Store order", email_from: "no_reply@apple.com" },
  { id: "s5", merchant: "Spotify", amount: 11.99, currency: "USD", category: "Entertainment", purchased_at: "2026-09-05", email_subject: "Your Spotify Premium receipt", email_from: "no-reply@spotify.com" },
  { id: "s6", merchant: "Whole Foods", amount: 96.32, currency: "USD", category: "Food", purchased_at: "2026-09-03", email_subject: "Order delivered", email_from: "orders@wholefoods.com" },
  { id: "s7", merchant: "City Power & Light", amount: 74.1, currency: "USD", category: "Utilities", purchased_at: "2026-09-01", email_subject: "August statement is ready", email_from: "billing@citypower.com" },
  { id: "s8", merchant: "Delta Air Lines", amount: 412.6, currency: "USD", category: "Travel", purchased_at: "2026-08-27", email_subject: "Your flight confirmation", email_from: "confirmation@delta.com" },
  { id: "s9", merchant: "CVS Pharmacy", amount: 32.18, currency: "USD", category: "Health", purchased_at: "2026-08-24", email_subject: "eReceipt from CVS", email_from: "receipts@cvs.com" },
  { id: "s10", merchant: "Figma", amount: 45, currency: "USD", category: "Subscriptions", purchased_at: "2026-08-20", email_subject: "Figma payment receipt", email_from: "billing@figma.com" },
];
