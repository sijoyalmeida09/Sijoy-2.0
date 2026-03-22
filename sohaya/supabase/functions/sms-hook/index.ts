import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const MSG91_AUTHKEY = Deno.env.get("MSG91_AUTHKEY")!;
const MSG91_TEMPLATE_ID = Deno.env.get("MSG91_TEMPLATE_ID")!;
const HOOK_SECRET = Deno.env.get("SEND_SMS_HOOK_SECRET")!;

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Verify webhook signature
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    const wh = new Webhook(HOOK_SECRET);
    const { user, sms } = wh.verify(payload, headers) as {
      user: { phone: string; id: string };
      sms: { otp: string };
    };

    // Send OTP via MSG91
    const phone = user.phone.replace("+", "");
    const response = await fetch(
      `https://control.msg91.com/api/v5/otp?template_id=${MSG91_TEMPLATE_ID}&mobile=${phone}&otp=${sms.otp}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authkey: MSG91_AUTHKEY,
        },
      }
    );

    const result = await response.json();
    console.log("MSG91 response:", JSON.stringify(result));

    if (result.type === "success" || result.type === "OTP_SENT") {
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.error("MSG91 error:", result);
    return new Response(
      JSON.stringify({ error: { msg: result.message || "SMS send failed" } }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Hook error:", err);
    return new Response(
      JSON.stringify({ error: { msg: (err as Error).message } }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
