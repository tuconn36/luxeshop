/**
 * scripts/testOtp.js - Test gửi OTP (chạy local)
 *
 *   node scripts/testOtp.js your-email@gmail.com
 *
 * Sẽ gọi sendOtpEmail() trực tiếp để kiểm tra cấu hình SMTP.
 */

require('dotenv').config();
const { sendOtpEmail } = require('../lib/mailer');

async function main() {
  const target = process.argv[2];
  if (!target) {
    console.error('Cách dùng: node scripts/testOtp.js <email>');
    process.exit(1);
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  console.log(`▶ Gửi OTP test đến ${target} ...`);
  const result = await sendOtpEmail(target, code);
  console.log('Kết quả:', result);

  if (result.ok && result.channel === 'smtp') {
    console.log('✅ Email đã được gửi thành công. Kiểm tra inbox (kể cả spam).');
  } else if (result.channel === 'dev-log') {
    console.log(`ℹ️  Đang ở dev mode (không có SMTP_USER). OTP: ${code}`);
    console.log('   File log:', require('path').join(__dirname, '../logs/otp.log'));
  } else {
    console.log('❌ Gửi thất bại. Kiểm tra lại SMTP_USER, SMTP_PASS, App Password.');
    process.exit(2);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });