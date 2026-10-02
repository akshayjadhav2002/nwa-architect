import nodemailer from 'nodemailer';

export interface InquiryNotificationPayload {
  id?: string;
  name: string;
  email: string;
  phone: string;
  projectType: string;
  message: string;
  submittedAt?: string;
}

export interface MailSendResult {
  success: boolean;
  messageId?: string;
  recipient: string;
  mode: 'smtp' | 'simulated';
  error?: string;
}

const PRIMARY_STUDIO_EMAIL = 'nwa.architects2002@gmail.com';

/**
 * Creates and configures the nodemailer transporter.
 * Supports standard SMTP (host/port) or direct Gmail transport.
 */
function getTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASSWORD;
  const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

  if (smtpUser && smtpPass) {
    if (smtpHost) {
      return nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    }

    // Default to Gmail service if user/pass provided without custom host
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  return null;
}

/**
 * Sends an automated inquiry notification email to the studio inbox (nwa.architects2002@gmail.com).
 */
export async function sendInquiryNotification(inquiry: InquiryNotificationPayload): Promise<MailSendResult> {
  const recipient = process.env.INQUIRY_NOTIFICATION_EMAIL || PRIMARY_STUDIO_EMAIL;
  const timestamp = inquiry.submittedAt || new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });

  const subject = `[New Inquiry] ${inquiry.projectType} — ${inquiry.name}`;

  const plainText = `
New Project Inquiry Received - NWA Architects
==================================================

Client Name:    ${inquiry.name}
Email Address:  ${inquiry.email}
Phone / Mobile: ${inquiry.phone}
Project Type:   ${inquiry.projectType}
Received At:    ${timestamp}

Client Project Brief:
--------------------------------------------------
${inquiry.message}

--------------------------------------------------
This notification was automatically sent from the NWA Architects Web Portal.
Reply directly to this email to respond to ${inquiry.name} (${inquiry.email}).
`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f5f6;
      margin: 0;
      padding: 24px;
      color: #191c1d;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e1e3e4;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .email-header {
      background-color: #191c1d;
      color: #ffffff;
      padding: 28px 32px;
      border-bottom: 3px solid #a33e00;
    }
    .email-header h1 {
      margin: 0 0 6px 0;
      font-family: Georgia, serif;
      font-size: 22px;
      letter-spacing: 0.5px;
      font-weight: 700;
      color: #ffffff;
    }
    .email-header .tagline {
      margin: 0;
      font-size: 11px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #e59866;
      font-weight: 600;
    }
    .email-body {
      padding: 32px;
    }
    .alert-banner {
      background-color: #fbf3ec;
      border-left: 4px solid #a33e00;
      padding: 12px 16px;
      margin-bottom: 24px;
      font-size: 13px;
      color: #782c00;
      font-weight: 500;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .details-table th {
      text-align: left;
      padding: 10px 12px;
      background-color: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #747878;
      width: 32%;
    }
    .details-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #e9ecef;
      font-size: 14px;
      color: #191c1d;
      font-weight: 500;
    }
    .message-box {
      background-color: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      padding: 18px 20px;
      margin-bottom: 28px;
    }
    .message-box h3 {
      margin: 0 0 10px 0;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #a33e00;
      font-weight: 700;
    }
    .message-box p {
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
      color: #2b2f31;
      white-space: pre-wrap;
    }
    .cta-container {
      text-align: center;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
    }
    .cta-button {
      display: inline-block;
      background-color: #a33e00;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 24px;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-radius: 2px;
    }
    .email-footer {
      background-color: #f8f9fa;
      padding: 20px 32px;
      border-top: 1px solid #e9ecef;
      font-size: 11px;
      color: #747878;
      line-height: 1.5;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="tagline">NWA Architects • Established 2002</div>
      <h1>New Project Inquiry</h1>
    </div>
    <div class="email-body">
      <div class="alert-banner">
        A new potential client inquiry has been submitted via the website contact form.
      </div>

      <table class="details-table">
        <tr>
          <th>Client Name</th>
          <td><strong>${escapeHtml(inquiry.name)}</strong></td>
        </tr>
        <tr>
          <th>Email</th>
          <td><a href="mailto:${escapeHtml(inquiry.email)}" style="color: #a33e00; text-decoration: none;">${escapeHtml(inquiry.email)}</a></td>
        </tr>
        <tr>
          <th>Phone</th>
          <td><a href="tel:${escapeHtml(inquiry.phone)}" style="color: #191c1d; text-decoration: none;">${escapeHtml(inquiry.phone)}</a></td>
        </tr>
        <tr>
          <th>Project Type</th>
          <td><span style="display: inline-block; background-color: #fbeee4; color: #a33e00; padding: 2px 8px; border-radius: 2px; font-weight: 600; font-size: 12px;">${escapeHtml(inquiry.projectType)}</span></td>
        </tr>
        <tr>
          <th>Received At</th>
          <td>${escapeHtml(timestamp)}</td>
        </tr>
      </table>

      <div class="message-box">
        <h3>Project Brief / Message</h3>
        <p>${escapeHtml(inquiry.message)}</p>
      </div>

      <div class="cta-container">
        <a href="mailto:${escapeHtml(inquiry.email)}?subject=Re:%20NWA%20Architects%20Inquiry%20-%20${encodeURIComponent(inquiry.projectType)}" class="cta-button">
          Reply to ${escapeHtml(inquiry.name)}
        </a>
      </div>
    </div>
    <div class="email-footer">
      Nileshh Waman &amp; Associates (NWA Architects)<br>
      Flat no. 3, 76-Shrushti Prabhat, Prabhat Road, Lane 15, Pune - 411004<br>
      This email was automatically dispatched to <strong>${escapeHtml(recipient)}</strong> upon inquiry submission.
    </div>
  </div>
</body>
</html>
`;

  const transporter = getTransporter();

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || `"NWA Architects Web" <${process.env.SMTP_USER || process.env.GMAIL_USER || 'no-reply@nwaarchitects.com'}>`,
        to: recipient,
        replyTo: `"${inquiry.name}" <${inquiry.email}>`,
        subject,
        text: plainText,
        html: htmlContent,
      });

      console.log(`[Mail Service] Successfully sent inquiry notification email to ${recipient} (Message ID: ${info.messageId})`);
      return {
        success: true,
        messageId: info.messageId,
        recipient,
        mode: 'smtp',
      };
    } catch (error: any) {
      console.error('[Mail Service] SMTP Error dispatching inquiry email:', error);
      return {
        success: false,
        recipient,
        mode: 'smtp',
        error: error.message || 'SMTP delivery failed',
      };
    }
  } else {
    // Log formatted simulated email dispatch when SMTP credentials are not yet injected into env
    console.log(`\n==================================================`);
    console.log(`[Mail Service - Outbox Simulation]`);
    console.log(`To: ${recipient}`);
    console.log(`Reply-To: "${inquiry.name}" <${inquiry.email}>`);
    console.log(`Subject: ${subject}`);
    console.log(`Client Phone: ${inquiry.phone}`);
    console.log(`Category: ${inquiry.projectType}`);
    console.log(`Message Preview: ${inquiry.message.slice(0, 100)}...`);
    console.log(`(Configure SMTP_USER / GMAIL_USER and SMTP_PASS / GMAIL_APP_PASSWORD in environment to send live SMTP emails)`);
    console.log(`==================================================\n`);

    return {
      success: true,
      recipient,
      mode: 'simulated',
      messageId: `simulated-${Date.now()}`,
    };
  }
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
