import { Resend } from "resend";

export async function sendWelcomeEmail(input: { to: string; fullName?: string | null }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.WELCOME_EMAIL_FROM;
  if (!key || !from) return;

  const resend = new Resend(key);
  const name = input.fullName ?? "there";

  await resend.emails.send({
    from,
    to: input.to,
    subject: "Welcome to One JoSho account",
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6">
        <h2 style="color:#1B2A4A">Welcome, ${name}</h2>
        <p>Your One JoSho account gives you a unified identity across Music, IT Solutions, and Real Estate services.</p>
        <ul>
          <li>Single login across JoSho sub-services</li>
          <li>Unified dashboard and loyalty points</li>
          <li>Faster updates for bookings, projects, and service notifications</li>
        </ul>
        <p style="margin-top:24px">JoSho Empire Central Hub</p>
      </div>
    `
  });
}
