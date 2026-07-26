import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'luxe_recently_viewed';
const MAX_ITEMS = 20; // Lưu tối đa 20 sp gần nhất
const MAX_AGE_DAYS = 30; // Sau 30 ngày thì xóa

/**
 * Hook quản lý danh sách sản phẩm đã xem gần đây.
 *
 * Lưu vào localStorage với cấu trúc:
 * [{ id, name, image, price, viewedAt, viewCount, duration }]
 *
 * - viewCount: số lần xem (mỗi lần mở sp sẽ tăng)
 * - duration: tổng thời gian khách ở lại trang (ms) — dùng để ranking
 * - viewedAt: timestamp lần cuối xem
 */
export function useRecentlyViewed() {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      // Lọc ra những sp quá cũ
      const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
      return parsed.filter((it) => it.viewedAt > cutoff);
    } catch {
      return [];
    }
  });

  // Đồng bộ xuống localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn('[useRecentlyViewed] Không thể lưu:', err);
    }
  }, [items]);

  // Lắng nghe logout — xóa hết
  useEffect(() => {
    const onLogout = () => {
      try {
        localStorage.removeItem(STORAGE_KEY);
        setItems([]);
      } catch { /* ignore */ }
    };
    window.addEventListener('luxe:user-logged-out', onLogout);
    return () => window.removeEventListener('luxe:user-logged-out', onLogout);
  }, []);

  /**
   * Track khi user mở PDP.
   * @param {Object} product - { id, name, image, price }
   */
  const trackView = useCallback((product) => {
    if (!product?.id) return;
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      const now = Date.now();
      if (idx > -1) {
        // Đã có → tăng viewCount + cập nhật viewedAt
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          viewCount: (updated[idx].viewCount || 1) + 1,
          viewedAt: now,
        };
        // Đẩy lên đầu
        const [item] = updated.splice(idx, 1);
        return [item, ...updated].slice(0, MAX_ITEMS);
      }
      // Mới — thêm vào đầu
      const newItem = {
        id: product.id,
        name: product.name,
        image: product.image || (product.images && product.images[0]),
        price: product.price,
        viewedAt: now,
        viewCount: 1,
        duration: 0,
      };
      return [newItem, ...prev].slice(0, MAX_ITEMS);
    });
  }, []);

  /**
   * Track thời gian user ở lại trang (tính bằng ms).
   * Gọi trong cleanup effect của PDP.
   */
  const trackDuration = useCallback((productId, durationMs) => {
    if (!productId || !durationMs) return;
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === productId);
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        duration: (updated[idx].duration || 0) + durationMs,
      };
      return updated;
    });
  }, []);

  /**
   * Xóa 1 sản phẩm khỏi danh sách.
   */
  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  /**
   * Xóa toàn bộ lịch sử.
   */
  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  return { items, trackView, trackDuration, removeItem, clearAll };
}

/**
 * Hook tự động track view khi mount + duration khi unmount.
 * Sử dụng trong PDP.
 */
export function useTrackView(product) {
  const { trackView, trackDuration } = useRecentlyViewed();
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (product?.id) {
      trackView({
        id: product.id,
        name: product.name,
        image: product.image || product.images?.[0],
        price: product.price,
      });
      startTimeRef.current = Date.now();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  useEffect(() => {
    return () => {
      if (product?.id) {
        const duration = Date.now() - startTimeRef.current;
        trackDuration(product.id, duration);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);
}
