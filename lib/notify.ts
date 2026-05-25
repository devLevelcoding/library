/**
 * Notification helper — tries channels in order:
 *  1. Telegram  (set TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID)
 *  2. Resend    (set RESEND_API_KEY + NOTIFY_FROM_EMAIL + NOTIFY_TO_EMAIL)
 *  3. Console   (always works — logs the message)
 *
 * Telegram setup (2 min, free):
 *  1. Message @BotFather on Telegram → /newbot → copy token
 *  2. Message your new bot once, then open:
 *     https://api.telegram.org/bot<TOKEN>/getUpdates
 *     and copy "chat":"id" value
 *  3. Add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to Vercel env vars
 */

export interface NotifyPayload {
  subject: string   // plain text — used as Telegram header + email subject
  body: string      // plain text body
  html?: string     // optional rich HTML for Resend email
  toEmail?: string  // recipient email (for user-facing emails via Resend)
}

export async function notify(payload: NotifyPayload): Promise<void> {
  const { subject, body, html, toEmail } = payload

  // ── 1. Telegram ─────────────────────────────────────────────────────────
  const tgToken = process.env.TELEGRAM_BOT_TOKEN
  const tgChat  = process.env.TELEGRAM_CHAT_ID
  if (tgToken && tgChat) {
    const text = `*${escMd(subject)}*\n\n${escMd(body)}`
    try {
      await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: tgChat, text, parse_mode: "MarkdownV2" }),
      })
      return
    } catch (e) {
      console.error("[notify] Telegram failed:", e)
    }
  }

  // ── 2. Resend ────────────────────────────────────────────────────────────
  const resendKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.NOTIFY_FROM_EMAIL ?? "noreply@yourdomain.com"
  const destEmail = toEmail ?? process.env.NOTIFY_TO_EMAIL
  if (resendKey && destEmail) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromEmail,
          to: destEmail,
          subject,
          text: body,
          ...(html ? { html } : {}),
        }),
      })
      return
    } catch (e) {
      console.error("[notify] Resend failed:", e)
    }
  }

  // ── 3. Console fallback ──────────────────────────────────────────────────
  console.log(`[notify] ${subject}\n${body}`)
}

// Escape special chars for Telegram MarkdownV2
function escMd(s: string) {
  return s.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&")
}
