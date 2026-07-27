/**
 * Smoke test: gửi 1 email qua nodemailer vào mock SMTP local.
 * Verify full round-trip: nodemailer → TCP socket → mockSmtpServer.
 *
 * Chạy:
 *   Terminal 1: npm run mail:mock
 *   Terminal 2: node scripts/testMockSmtp.js
 */

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: '127.0.0.1',
  port: 2525,
  secure: false,
  tls: { rejectUnauthorized: false },
});

const code = Math.floor(100000 + Math.random() * 900000).toString();

transporter.sendMail({
  from: '"Luxe Jewelry" <dev@localhost>',
  to: 'test@gmail.com',
  subject: `[${code}] Mã xác thực Luxe Jewelry của bạn`,
  text: `Mã xác thực của bạn là: ${code}\nMã có hiệu lực trong 10 phút.`,
  html: `<b>${code}</b>`,
}).then((info) => {
  console.log('✅ Email sent to mock SMTP');
  console.log('   messageId:', info.messageId);
  console.log('   response:', info.response);
  console.log('   → Check Terminal 1 (mail:mock) hoặc api/logs/email-inbox.log');
  process.exit(0);
}).catch((err) => {
  console.error('❌ Send failed:', err.message);
  process.exit(1);
});