import { useState, useEffect } from 'react';
import { productsAPI } from '@/lib/api';

export function useProducts(filters = {}, page = 1, perPage = 12) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = {};

        if (filters.category) {
          queryParams.category = filters.category;
        }

        if (filters.brand) {
          queryParams.brand = filters.brand;
        }

        if (filters.minPrice !== undefined) {
          queryParams.minPrice = filters.minPrice;
        }

        if (filters.maxPrice !== undefined) {
          queryParams.maxPrice = filters.maxPrice;
        }

        if (filters.search) {
          queryParams.search = filters.search;
        }

        if (filters.sort) {
          queryParams.sort = filters.sort;
        }

        const result = await productsAPI.getList(page, perPage, queryParams);

        setProducts(result.items || []);
        setTotalPages(result.totalPages || 0);
        setTotalItems(result.totalItems || 0);
      } catch (err) {
        console.warn('Failed to fetch products:', err.message);
        
        // Provide user-friendly error messages
        let userMessage = 'Không thể tải sản phẩm. Vui lòng thử lại sau.';
        
        if (err.isNetworkError) {
          userMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        } else if (err.status === 500) {
          userMessage = 'Server đang gặp sự cố. Vui lòng thử lại sau.';
        } else if (err.status === 404) {
          userMessage = 'Không tìm thấy sản phẩm.';
        }
        
        setError(userMessage);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters.category, filters.brand, filters.minPrice, filters.maxPrice, filters.search, filters.sort, page, perPage]);

  return { products, loading, error, totalPages, totalItems };
}
