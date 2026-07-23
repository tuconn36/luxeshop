-- ============================================
-- MIGRATION: Make email nullable for phone-only users
-- (Chạy file này 1 lần trên database đang có dữ liệu)
-- ============================================

-- Bước 1: Xoá các user đang dùng email giả @phone.luxe.vn để tránh
-- trùng unique khi user mới đăng ký bằng SĐT cũng muốn email = NULL.
-- Nếu cần giữ dữ liệu, comment block này lại và tự xử lý trước.
DELETE FROM users WHERE email LIKE '%@phone.luxe.vn';

-- Bước 2: Cho phép email NULL
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;