import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ProductDetailPageSimple() {
  const { id } = useParams();
  const [product, setProduct] = useState({
    id: 1,
    name: 'Test Product',
    price: 299000,
    description: 'Mô tả test',
    images: ['https://via.placeholder.com/400'],
    category: 'Nam',
    stock: 50
  });

  return (
    <div style={{ padding: 50 }}>
      <h1>Test Page - ID: {id}</h1>
      <div style={{ marginTop: 30, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
        <img src={product.images[0]} alt={product.name} style={{ width: '100%' }} />
        <div>
          <p>Category: {product.category}</p>
          <h2 style={{ fontSize: 28 }}>{product.name}</h2>
          <p style={{ fontSize: 24, color: 'blue' }}>{product.price.toLocaleString('vi-VN')}₫</p>
          <p>{product.description}</p>
          <button style={{ padding: '10px 20px', marginTop: 20, background: 'black', color: 'white' }}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
