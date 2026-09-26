// Production Transactional Email Service for Tulis using Resend
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Default sender. Resend free tier provides 'onboarding@resend.dev' out of the box
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Tulis <onboarding@resend.dev>';

// Official Public CDN Logo Assets hosted on GitHub repo
const TULIS_ICON_URL = 'https://raw.githubusercontent.com/deepakp9653-sketch/TULIS/main/public/tulis-logo.png.jpeg';

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Dispatches 6-digit email verification OTP to users via Resend
 * Highly polished, professional dark-mode design matching Tulis design system.
 */
export async function sendVerificationOtpEmail(
  toEmail: string,
  otpCode: string,
  userName: string = 'Traveler'
): Promise<SendEmailResult> {
  const subject = `${otpCode} is your Tulis verification code`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tulis Verification Code</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0A0D08; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0A0D08; padding: 40px 16px;">
          <tr>
            <td align="center">
              <!-- Main Container -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #141912; border: 1px solid #242D21; border-radius: 24px; overflow: hidden; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7);">
                <!-- Top Emerald Gradient Bar -->
                <tr>
                  <td style="height: 5px; background: linear-gradient(90deg, #2D6A4F, #5FA97D, #84CC16);"></td>
                </tr>

                <!-- Header & Logo -->
                <tr>
                  <td style="padding: 36px 32px 20px 32px; text-align: center;">
                    <!-- Tulis Official Logo Emblem -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 16px auto;">
                      <tr>
                        <td align="center" style="width: 64px; height: 64px; background-color: #0C100B; border: 1.5px solid rgba(95, 169, 125, 0.4); border-radius: 18px; padding: 4px; box-shadow: 0 8px 24px rgba(95, 169, 125, 0.2);">
                          <img src="${TULIS_ICON_URL}" width="54" height="54" alt="Tulis Logo" style="display: block; border-radius: 14px; object-fit: cover;" />
                        </td>
                      </tr>
                    </table>

                    <!-- Security Pill Badge -->
                    <div style="margin-bottom: 12px;">
                      <span style="display: inline-block; padding: 4px 14px; background-color: rgba(95, 169, 125, 0.12); border: 1px solid rgba(95, 169, 125, 0.35); border-radius: 100px; color: #5FA97D; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">
                        Identity Verification
                      </span>
                    </div>

                    <h1 style="color: #F4F2E6; font-size: 24px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: -0.5px;">
                      Your Login Verification Code
                    </h1>
                    <p style="color: #8B9A8C; font-size: 14px; line-height: 1.5; margin: 0;">
                      Hi <span style="color: #F4F2E6; font-weight: 600;">${userName}</span>, enter this 6-digit one-time code to authenticate your Tulis account and access your squad ledgers.
                    </p>
                  </td>
                </tr>

                <!-- Code Container -->
                <tr>
                  <td style="padding: 0 32px;">
                    <div style="background-color: #0C100A; border: 2px dashed #3E7D5A; border-radius: 18px; padding: 26px 16px; text-align: center; margin: 8px 0 20px 0; box-shadow: inset 0 2px 8px rgba(0,0,0,0.5);">
                      <div style="font-family: 'SF Mono', 'Roboto Mono', Menlo, Consolas, Monaco, monospace; font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #5FA97D; margin-left: 12px; line-height: 1.1;">
                        ${otpCode}
                      </div>
                      <div style="margin-top: 12px; font-size: 11px; font-weight: 600; color: #728473; letter-spacing: 1.5px; text-transform: uppercase;">
                        ⏱️ Expires in 15 minutes • One-time use
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Security & Feature Highlights -->
                <tr>
                  <td style="padding: 0 32px 28px 32px;">
                    <div style="background-color: #10140E; border: 1px solid #1E261B; border-radius: 14px; padding: 18px; margin-bottom: 20px;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="padding-bottom: 10px; font-size: 12px; color: #C2CEC3; line-height: 1.5;">
                            🔒 <strong style="color: #F4F2E6;">Passwordless Security:</strong> Instant cryptographically signed session without vulnerable passwords.
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom: 10px; font-size: 12px; color: #C2CEC3; line-height: 1.5;">
                            ⚖️ <strong style="color: #F4F2E6;">Deterministic Zero-Sum Ledger:</strong> Continuous mathematical proof across all group splits.
                          </td>
                        </tr>
                        <tr>
                          <td style="font-size: 12px; color: #C2CEC3; line-height: 1.5;">
                            📲 <strong style="color: #F4F2E6;">UPI Peer Settlements:</strong> Direct organizer & traveler settlements via QR code and deep links.
                          </td>
                        </tr>
                      </table>
                    </div>

                    <p style="color: #6C7A6D; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                      If you did not request this login code, no action is required. Your account remains completely secure.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 32px; background-color: #0E120D; border-top: 1px solid #1E261B; text-align: center;">
                    <div style="font-size: 13px; font-weight: 700; color: #5FA97D; letter-spacing: 1px; margin-bottom: 4px;">
                      TULIS
                    </div>
                    <p style="color: #6C7A6D; font-size: 11px; margin: 0 0 8px 0;">
                      One Trip. One Ledger. Zero Confusion.
                    </p>
                    <p style="color: #4D574E; font-size: 10px; margin: 0;">
                      © 2026 Tulis • High-Precision Group Travel Financial Infrastructure
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  if (!resend) {
    console.error('[Resend Error] RESEND_API_KEY environment variable is not configured.');
    return {
      success: false,
      error: 'Resend API key is not configured on the server. Please check environment variables.',
    };
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject,
      html,
    });

    if (data.error) {
      console.error('[Resend API Error]:', data.error);
      return { success: false, error: data.error.message };
    }

    console.log(`[Resend] Verification OTP sent successfully to ${toEmail}. Message ID: ${data.data?.id}`);
    return { success: true, messageId: data.data?.id };
  } catch (err: any) {
    console.error('[Resend Exception]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Sends a Trip Invitation Email with unique 6-character code & deep link
 * Professional, branded design matching Tulis FinTech UI
 */
export async function sendTripInviteEmail(
  toEmail: string,
  inviterName: string,
  tripTitle: string,
  inviteCode: string,
  joinUrl: string
): Promise<SendEmailResult> {
  const subject = `${inviterName} invited you to join "${tripTitle}" on Tulis`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tulis Trip Invitation</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0A0D08; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0A0D08; padding: 40px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #141912; border: 1px solid #242D21; border-radius: 24px; overflow: hidden; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7);">
                <!-- Top Emerald Gradient Bar -->
                <tr>
                  <td style="height: 5px; background: linear-gradient(90deg, #2D6A4F, #5FA97D, #84CC16);"></td>
                </tr>

                <!-- Header & Logo -->
                <tr>
                  <td style="padding: 36px 32px 20px 32px; text-align: center;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 16px auto;">
                      <tr>
                        <td align="center" style="width: 64px; height: 64px; background-color: #0C100B; border: 1.5px solid rgba(95, 169, 125, 0.4); border-radius: 18px; padding: 4px; box-shadow: 0 8px 24px rgba(95, 169, 125, 0.2);">
                          <img src="${TULIS_ICON_URL}" width="54" height="54" alt="Tulis Logo" style="display: block; border-radius: 14px; object-fit: cover;" />
                        </td>
                      </tr>
                    </table>

                    <div style="margin-bottom: 12px;">
                      <span style="display: inline-block; padding: 4px 14px; background-color: rgba(95, 169, 125, 0.12); border: 1px solid rgba(95, 169, 125, 0.35); border-radius: 100px; color: #5FA97D; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">
                        Trip Invitation
                      </span>
                    </div>

                    <h1 style="color: #F4F2E6; font-size: 24px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: -0.5px;">
                      You're Invited to Join a Squad Trip!
                    </h1>
                    <p style="color: #8B9A8C; font-size: 14px; line-height: 1.6; margin: 0;">
                      <strong style="color: #F4F2E6;">${inviterName}</strong> has invited you to join <strong style="color: #5FA97D;">"${tripTitle}"</strong> on Tulis. All lodging splits, bookings, and instant UPI balances will be coordinated automatically.
                    </p>
                  </td>
                </tr>

                <!-- Code Container -->
                <tr>
                  <td style="padding: 0 32px;">
                    <div style="background-color: #0C100A; border: 1.5px solid #2D6A4F; border-radius: 18px; padding: 22px 16px; text-align: center; margin: 8px 0 24px 0;">
                      <div style="font-size: 11px; font-weight: 700; color: #728473; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px;">
                        Trip Invite Code
                      </div>
                      <div style="font-family: 'SF Mono', 'Roboto Mono', Menlo, Consolas, Monaco, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #5FA97D; margin-left: 8px;">
                        ${inviteCode}
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td style="padding: 0 32px 28px 32px; text-align: center;">
                    <a href="${joinUrl}" style="display: inline-block; width: 100%; max-width: 320px; background: linear-gradient(135deg, #2D6A4F, #5FA97D); color: #0A0D08; font-weight: 700; font-size: 14px; text-decoration: none; padding: 15px 24px; border-radius: 14px; box-shadow: 0 8px 20px rgba(95, 169, 125, 0.3); text-align: center; box-sizing: border-box;">
                      Join Trip & View Ledger →
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 32px; background-color: #0E120D; border-top: 1px solid #1E261B; text-align: center;">
                    <div style="font-size: 13px; font-weight: 700; color: #5FA97D; letter-spacing: 1px; margin-bottom: 4px;">
                      TULIS
                    </div>
                    <p style="color: #6C7A6D; font-size: 11px; margin: 0;">
                      © 2026 Tulis • One Trip. One Ledger. Zero Confusion.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  if (!resend) {
    console.error('[Resend Error] RESEND_API_KEY environment variable is not configured.');
    return { success: false, error: 'Resend API key is not configured.' };
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject,
      html,
    });

    if (data.error) {
      console.error('[Resend Invite Error]:', data.error);
      return { success: false, error: data.error.message };
    }

    return { success: true, messageId: data.data?.id };
  } catch (err: any) {
    console.error('[Resend Invite Exception]:', err.message);
    return { success: false, error: err.message };
  }
}
