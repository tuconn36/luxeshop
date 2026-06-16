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

        setProducts(result.items);
        setTotalPages(result.totalPages);
        setTotalItems(result.totalItems);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters.category, filters.minPrice, filters.maxPrice, filters.search, filters.sort, page, perPage]);

  return { products, loading, error, totalPages, totalItems };
}