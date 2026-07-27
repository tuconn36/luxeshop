/**
 * Mock SMTP Server (chỉ dùng cho local dev)
 *
 * Listen port 2525 (mặc định, override bằng MOCK_SMTP_PORT).
 * Nhận bất kỳ email nào từ nodemailer, in OTP ra terminal + append vào logs/email-inbox.log.
 *
 * Khi API process gọi sendOtpEmail() với:
 *   SMTP_HOST=localhost
 *   SMTP_PORT=2525
 * → nodemailer sẽ gửi thật qua TCP socket vào server này.
 *   Đây là "code thật" — same code path như Gmail, chỉ khác destination.
 *
 * Chạy:
 *   node scripts/mockSmtpServer.js
 *   hoặc: npm run mail:mock
 */

const path = require('path');
const fs = require('fs');

const smtpServerFactory = (() => {
  try {
    return require('smtp-server');
  } catch (err) {
    console.error('\n[mock-smtp] Thiếu package "smtp-server".');
    console.error('  Cài: npm install --save-optional smtp-server\n');
    process.exit(1);
  }
})();

const SMTPServer = smtpServerFactory.SMTPServer || smtpServerFactory;

const PORT = parseInt(process.env.MOCK_SMTP_PORT || '2525', 10);
const INBOX_LOG = path.join(__dirname, '../logs/email-inbox.log');

function ensureLogDir() {
  const dir = path.dirname(INBOX_LOG);
  if (!fs.existsSync(dir)) {
    try { fs.mkdirSync(dir, { recursive: true }); } catch (_) {}
  }
}

function extractOtp(text) {
  // OTP của Luxe luôn là 6 chữ số liền nhau (theo generateOtpCode).
  const m = /Mã xác thực của bạn là:\s*(\d{6})/i.exec(text || '')
        || /\b(\d{6})\b/.exec(text || '');
  return m ? m[1] : null;
}

const server = new SMTPServer({
  authOptional: true,
  disabledCommands: ['AUTH', 'STARTTLS'],
  logger: false,
  onData(stream, session, callback) {
    let body = '';
    stream.on('data', (chunk) => { body += chunk.toString('utf8'); });
    stream.on('end', () => {
      const rcptArr = (session.envelope && session.envelope.rcptTo) || [];
      const to = Array.isArray(rcptArr) && rcptArr.length
        ? rcptArr.map((r) => (r && r.address) || r).join(', ')
        : '?';
      const mailFrom = session.envelope && session.envelope.mailFrom;
      const from = (mailFrom && mailFrom.address) || '?';
      const otp = extractOtp(body);

      ensureLogDir();
      const ts = new Date().toISOString();
      const line = `[${ts}] FROM=${from} TO=${to} OTP=${otp || '(not-found)'}\n`;
      try { fs.appendFileSync(INBOX_LOG, line); } catch (_) {}

      const pad = (s, n) => String(s).padEnd(n, ' ');
      console.log('\n\x1b[36m┌─── 📧 MOCK SMTP ─────────────────────────────────────\x1b[0m');
      console.log(`\x1b[36m│\x1b[0m ${pad('From:', 8)} ${from}`);
      console.log(`\x1b[36m│\x1b[0m ${pad('To:', 8)} ${to}`);
      console.log(`\x1b[36m│\x1b[0m ${pad('OTP:', 8)} \x1b[33m${otp || '(không tìm thấy 6 chữ số)'}\x1b[0m`);
      console.log(`\x1b[36m│\x1b[0m ${pad('Saved:', 8)} ${INBOX_LOG}`);
      console.log('\x1b[36m└───────────────────────────────────────────────────────\x1b[0m');

      callback();
    });
  },
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n📬 Mock SMTP server listening on 127.0.0.1:${PORT}`);
  console.log('   → Mọi email từ API sẽ được in tại đây thay vì gửi ra ngoài.');
  console.log('   → Inbox lưu tại: ' + INBOX_LOG);
  console.log('   → Nhấn Ctrl+C để dừng.\n');
});

server.on('error', (err) => {
  console.error('[mock-smtp] Server error:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`  Port ${PORT} đã bị chiếm. Đổi MOCK_SMTP_PORT sang port khác.`);
  }
});