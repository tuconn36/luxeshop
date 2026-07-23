// Helpers để hiển thị thông tin user một cách nhất quán.
// Sau khi chạy migration make_email_nullable.sql, user đăng ký bằng SĐT
// sẽ có email = NULL. Helper này cũng xử lý các user cũ (trước migration)
// vẫn đang dùng email giả kiểu "xxx@phone.luxe.vn".

const SYNTHETIC_EMAIL_DOMAINS = ['@phone.luxe.vn', '@luxe.vn'];

export function isSyntheticEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const lower = email.toLowerCase();
  return SYNTHETIC_EMAIL_DOMAINS.some((d) => lower.endsWith(d));
}

// Trả về email "thật" của user (loại bỏ email giả).
export function getRealEmail(user) {
  if (!user?.email) return null;
  return isSyntheticEmail(user.email) ? null : user.email;
}

// Contact chính để hiển thị (ưu tiên email thật, sau đó SĐT).
export function getContact(user) {
  const email = getRealEmail(user);
  return email || user?.phone || null;
}

export function getContactLabel(user) {
  const email = getRealEmail(user);
  if (email) return email;
  if (user?.phone) return user.phone;
  return '';
}