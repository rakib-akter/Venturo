/**
 * Minimal transactional email via Resend's REST API (no SDK, so it doesn't
 * pull a native dependency). Env-gated: if RESEND_API_KEY isn't set, sending is
 * a no-op and the caller falls back to logging the link (dev) — the app stays
 * fully functional without an email provider configured.
 */

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ sent: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false };
  const from = process.env.EMAIL_FROM ?? "Venturo <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: opts.to, subject: opts.subject, html: opts.html, text: opts.text }),
    });
    if (!res.ok) return { sent: false, error: `Resend ${res.status}` };
    return { sent: true };
  } catch (e) {
    return { sent: false, error: String(e) };
  }
}
