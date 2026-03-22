import crypto from "crypto";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID ?? "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";
const RAZORPAY_BASE = "https://api.razorpay.com/v1";

function authHeader() {
  const encoded = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
  return `Basic ${encoded}`;
}

async function razorpayFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${RAZORPAY_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    }
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.description ?? `Razorpay ${res.status}`);
  return body;
}

export async function createOrder(input: {
  amount: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}) {
  return razorpayFetch("/orders", {
    method: "POST",
    body: JSON.stringify({
      amount: Math.round(input.amount * 100),
      currency: input.currency ?? "INR",
      receipt: input.receipt,
      notes: input.notes ?? {}
    })
  });
}

export async function createTransfer(input: {
  paymentId: string;
  artistAccountId: string;
  amount: number;
  currency?: string;
  notes?: Record<string, string>;
}) {
  return razorpayFetch(`/payments/${input.paymentId}/transfers`, {
    method: "POST",
    body: JSON.stringify({
      transfers: [
        {
          account: input.artistAccountId,
          amount: Math.round(input.amount * 100),
          currency: input.currency ?? "INR",
          notes: input.notes ?? {}
        }
      ]
    })
  });
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";
  if (!webhookSecret || !signature) return false;
  const expected = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function verifyPaymentSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const generated = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(generated), Buffer.from(input.signature));
}

export function getRazorpayKeyId() {
  return RAZORPAY_KEY_ID;
}
