import crypto from 'crypto'

// Razorpay is a CommonJS module – use require to avoid ESM issues
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Razorpay = require('razorpay')

// Lazy-initialize to avoid build-time failures when env vars aren't set
function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder',
  })
}

export const razorpay = {
  orders: {
    create: (opts: Record<string, unknown>) => getRazorpay().orders.create(opts),
  },
  payments: {
    capture: (id: string, amount: number, currency: string) =>
      getRazorpay().payments.capture(id, amount, currency),
  },
  payouts: {
    create: (opts: Record<string, unknown>) => getRazorpay().payouts?.create(opts),
  },
}

export interface CreateOrderOptions {
  amount_inr: number
  booking_id: string
  provider_name: string
  event_type: string
  client_name: string
  client_email: string
  client_phone?: string
}

export async function createOrder(options: CreateOrderOptions) {
  const order = await getRazorpay().orders.create({
    amount: options.amount_inr * 100, // paise
    currency: 'INR',
    receipt: `sohala_${options.booking_id}`,
    notes: {
      booking_id: options.booking_id,
      provider_name: options.provider_name,
      event_type: options.event_type,
    },
  })

  return order
}

export function verifyPaymentSignature(params: {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}): boolean {
  const body = `${params.razorpay_order_id}|${params.razorpay_payment_id}`
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex')

  return expectedSignature === params.razorpay_signature
}

export async function capturePayment(paymentId: string, amountInr: number) {
  return getRazorpay().payments.capture(paymentId, amountInr * 100, 'INR')
}

export async function inititatePayout(params: {
  account_number: string
  ifsc: string
  name: string
  amount_inr: number
  booking_id: string
}) {
  // Razorpay X payout — requires RazorpayX account
  return getRazorpay().payouts?.create({
    account_number: process.env.RAZORPAY_X_ACCOUNT_NUMBER,
    fund_account: {
      account_type: 'bank_account',
      bank_account: {
        name: params.name,
        ifsc: params.ifsc,
        account_number: params.account_number,
      },
      contact: {
        name: params.name,
        type: 'vendor',
      },
    },
    amount: params.amount_inr * 100,
    currency: 'INR',
    mode: 'NEFT',
    purpose: 'payout',
    notes: {
      booking_id: params.booking_id,
    },
  })
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || ''
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex')
  return expectedSignature === signature
}
