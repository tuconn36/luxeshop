/**
 * Mailer - Gửi OTP qua email (Gmail SMTP / Resend / generic SMTP)
 *
 * - Production: bật SMTP_*, hệ thống sẽ gửi mail thật.
 * - Development: nếu KHÔNG có SMTP_USER thì sẽ fallback về "dev mode":
 *   chỉ log OTP ra console + file logs/otp.log để dev test được.
 *
 * Biến môi trường:
 *   SMTP_HOST        (vd: smtp.gmail.com, smtp.resend.com)
 *   SMTP_PORT        (465 cho SSL, 587 cho STARTTLS)
 *   SMTP_SECURE      ('true' để dùng TLS)
 *   SMTP_USER
 *   SMTP_PASS        (App Password nếu dùng Gmail)
 *   OTP_FROM         (vd: "Luxe Jewelry <no-reply@luxeshop.vn>")
 *   APP_NAME         (tên hiển thị trong email, mặc định: "Luxe Jewelry")
 */

const fs = require('fs');
const path = require('path');

const OTP_LOG_FILE = path.join(__dirname, '../logs/otp.log');

function ensureLogDir() {
  const dir = path.dirname(OTP_LOG_FILE);
  if (!fs.existsSync(dir)) {
    try { fs.mkdirSync(dir, { recursive: true }); } catch (_) {}
  }
}

function logToFile(identifier, code, channel) {
  ensureLogDir();
  const ts = new Date().toISOString();
  const line = `[${ts}] [${channel}] ${identifier} => ${code}\n`;
  try { fs.appendFileSync(OTP_LOG_FILE, line); } catch (_) {}
  return line.trim();
}

// Tạo HTML email đẹp cho OTP
function buildOtpEmail({ code, appName = 'Luxe Jewelry', expireMinutes = 10 }) {
  return {
    subject: `[${code}] Mã xác thực ${appName} của bạn`,
    text: `Mã xác thực của bạn là: ${code}\nMã có hiệu lực trong ${expireMinutes} phút.\nNếu bạn không yêu cầu mã này, vui lòng bỏ qua email.`,
    html: `
      <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#fafafa">
        <div style="background:#fff;border:1px solid #eee;border-radius:12px;padding:32px;text-align:center">
          <h1 style="margin:0 0 8px;font-size:20px;color:#111">${appName}</h1>
          <p style="margin:0 0 24px;color:#666;font-size:14px">Mã xác thực đăng nhập / đăng ký</p>
          <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#111;background:#f4f4f5;border-radius:8px;padding:16px 0;margin:0 0 16px">${code}</div>
          <p style="margin:0;color:#666;font-size:13px">Mã có hiệu lực trong <strong>${expireMinutes} phút</strong>.</p>
          <p style="margin:16px 0 0;color:#999;font-size:12px">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>
        </div>
        <p style="text-align:center;color:#aaa;font-size:11px;margin-top:16px">© ${new Date().getFullYear()} ${appName}</p>
      </div>
    `,
  };
}

/**
 * Gửi OTP qua email
 * @param {string} toEmail
 * @param {string} code
 * @returns {Promise<{ok: boolean, channel: string, error?: string}>}
 */
async function sendOtpEmail(toEmail, code) {
  const appName = process.env.APP_NAME || 'Luxe Jewelry';
  const expireMinutes = parseInt(process.env.OTP_EXPIRE_MINUTES || '10', 10);

  const hasSmtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

  // Dev fallback: không có SMTP config → chỉ log ra console/file
  if (!hasSmtp) {
    const entry = logToFile(toEmail, code, 'EMAIL-DEV');
    console.log(`📧 [DEV OTP - EMAIL] ${toEmail} => ${code}`);
    return { ok: true, channel: 'dev-log', log: entry };
  }

  // Lazy-load nodemailer để không phải cài nếu user chưa dùng SMTP
  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch (err) {
    console.warn('[mailer] nodemailer chưa được cài. Chạy: npm install nodemailer');
    const entry = logToFile(toEmail, code, 'EMAIL-FALLBACK');
    return { ok: false, channel: 'fallback-log', error: 'nodemailer_not_installed', log: entry };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: String(process.env.SMTP_SECURE || 'true').toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    pool: true,
    maxConnections: 3,
  });

  const { subject, text, html } = buildOtpEmail({ code, appName, expireMinutes });

  try {
    const info = await transporter.sendMail({
      from: process.env.OTP_FROM || `"${appName}" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject,
      text,
      html,
    });
    logToFile(toEmail, code, 'EMAIL-SENT');
    console.log(`📧 [OTP EMAIL SENT] ${toEmail} messageId=${info.messageId}`);
    return { ok: true, channel: 'smtp', messageId: info.messageId };
  } catch (err) {
    console.error('[mailer] sendMail error:', err.message);
    const entry = logToFile(toEmail, code, 'EMAIL-ERROR');
    return { ok: false, channel: 'smtp', error: err.message, log: entry };
  } finally {
    try { transporter.close(); } catch (_) {}
  }
}

module.exports = { sendOtpEmail, buildOtpEmail };