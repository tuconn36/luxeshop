/**
 * SMS OTP - Gửi OTP qua SMS
 *
 * Hỗ trợ 2 provider:
 *   1. Twilio        - quốc tế (https://www.twilio.com)
 *   2. eSMS.vn       - Việt Nam (https://esms.vn)
 *
 * Biến môi trường (chọn 1 trong 2):
 *
 *   Twilio:
 *     SMS_PROVIDER=twilio
 *     TWILIO_ACCOUNT_SID=ACxxxxx
 *     TWILIO_AUTH_TOKEN=xxxxx
 *     TWILIO_FROM=+1234567890
 *
 *   eSMS:
 *     SMS_PROVIDER=esms
 *     ESMS_API_KEY=xxxxx
 *     ESMS_SECRET=xxxxx
 *     ESMS_BRANDNAME=LuxeJewelry   (Brandname đã đăng ký)
 *     ESMS_SEND_URL=https://api.esms.vn/MainService.svc/json/SendMessageAutoGen
 *
 * Nếu KHÔNG cấu hình provider → fallback về dev mode (chỉ log ra file).
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

function buildBody(code, appName = 'Luxe Jewelry', expireMinutes = 10) {
  return `[${appName}] Ma xac thuc cua ban la: ${code}. Hieu luc ${expireMinutes} phut. Neu ban khong yeu cau, vui long bo qua.`;
}

async function sendTwilio(toPhone, body) {
  // Twilio SDK được lazy-load để tránh lỗi khi user không dùng SMS
  let twilio;
  try {
    twilio = require('twilio');
  } catch (err) {
    throw new Error('twilio_not_installed: chạy `npm install twilio` để dùng SMS Twilio');
  }
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const msg = await client.messages.create({
    body,
    from: process.env.TWILIO_FROM,
    to: toPhone,
  });
  return { provider: 'twilio', sid: msg.sid, status: msg.status };
}

async function sendEsms(toPhone, body) {
  const fetchFn = globalThis.fetch || (await import('node-fetch')).default;
  const url = process.env.ESMS_SEND_URL || 'https://api.esms.vn/MainService.svc/json/SendMessageAutoGen';
  const payload = {
    ApiKey: process.env.ESMS_API_KEY,
    SecretKey: process.env.ESMS_SECRET,
    Phone: toPhone,
    Message: body,
    Brandname: process.env.ESMS_BRANDNAME || 'Notify',
    SmsType: '2',
  };
  const res = await fetchFn(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || (data.CodeResult && data.CodeResult !== '100')) {
    throw new Error(`esms_error: ${JSON.stringify(data)}`);
  }
  return { provider: 'esms', code: data.CodeResult, messageId: data.SMSID };
}

/**
 * Gửi OTP qua SMS
 * @param {string} toPhone  - số điện thoại (E.164 nếu Twilio, vd +84...; số local nếu eSMS)
 * @param {string} code
 */
async function sendOtpSms(toPhone, code) {
  const appName = process.env.APP_NAME || 'Luxe Jewelry';
  const expireMinutes = parseInt(process.env.OTP_EXPIRE_MINUTES || '10', 10);
  const provider = (process.env.SMS_PROVIDER || '').toLowerCase();

  // Nếu không có provider cấu hình → dev mode
  if (!provider) {
    const entry = logToFile(toPhone, code, 'SMS-DEV');
    console.log(`📱 [DEV OTP - SMS] ${toPhone} => ${code}`);
    return { ok: true, channel: 'dev-log', log: entry };
  }

  const body = buildBody(code, appName, expireMinutes);

  try {
    let result;
    if (provider === 'twilio') {
      result = await sendTwilio(toPhone, body);
    } else if (provider === 'esms') {
      result = await sendEsms(toPhone, body);
    } else {
      throw new Error(`unknown_sms_provider: ${provider}`);
    }
    logToFile(toPhone, code, 'SMS-SENT');
    console.log(`📱 [OTP SMS SENT] ${toPhone} provider=${provider}`);
    return { ok: true, channel: provider, ...result };
  } catch (err) {
    console.error('[sms] send error:', err.message);
    const entry = logToFile(toPhone, code, 'SMS-ERROR');
    return { ok: false, channel: provider, error: err.message, log: entry };
  }
}

module.exports = { sendOtpSms };