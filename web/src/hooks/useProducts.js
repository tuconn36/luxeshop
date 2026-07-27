import { useState, useEffect, useMemo } from 'react';
import { productsAPI } from '@/lib/api';

export function useProducts(filters = {}, page = 1, perPage = 12) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const { params, key: filtersKey } = useMemo(() => {
    const cleaned = {};
    if (filters.category) cleaned.category = filters.category;
    if (filters.brand) cleaned.brand = filters.brand;
    if (filters.minPrice !== undefined && filters.minPrice !== null) cleaned.minPrice = filters.minPrice;
    if (filters.maxPrice !== undefined && filters.maxPrice !== null) cleaned.maxPrice = filters.maxPrice;
    if (filters.search) cleaned.search = filters.search;
    if (filters.sort) cleaned.sort = filters.sort;
    return { params: cleaned, key: JSON.stringify(cleaned) };
  }, [filters.category, filters.brand, filters.minPrice, filters.maxPrice, filters.search, filters.sort]);

  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await productsAPI.getList(page, perPage, params);

        if (cancelled) return;
        setProducts(result.items || []);
        setTotalPages(result.totalPages || 0);
        setTotalItems(result.totalItems || 0);
      } catch (err) {
        if (cancelled) return;
        console.warn('Failed to fetch products:', err.message);

        let userMessage = 'Không thể tải sản phẩm. Vui lòng thử lại sau.';

        if (err.isNetworkError) {
          userMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        } else if (err.status === 500) {
          userMessage = 'Server đang gặp sự cố. Vui lòng thử lại sau.';
        } else if (err.status === 404) {
          userMessage = 'Không tìm thấy sản phẩm.';
        } else if (err.status === 429) {
          userMessage = 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi một chút.';
        }

        setError(userMessage);
        setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [filtersKey, page, perPage]);

  return { products, loading, error, totalPages, totalItems };
}
