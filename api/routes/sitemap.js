const express = require('express');
const router = express.Router();
const pool = require('../config/database');

const BASE_URL = process.env.FRONTEND_URL || 'https://luxe-fashion.vercel.app';

router.get('/sitemap.xml', async (req, res) => {
  try {
    const products = await pool.query('SELECT id, updated_at FROM products ORDER BY updated_at DESC');

    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/products', priority: '0.9', changefreq: 'daily' },
      { url: '/men', priority: '0.8', changefreq: 'weekly' },
      { url: '/women', priority: '0.8', changefreq: 'weekly' },
      { url: '/accessories', priority: '0.8', changefreq: 'weekly' },
      { url: '/new-arrivals', priority: '0.7', changefreq: 'daily' },
      { url: '/sale', priority: '0.7', changefreq: 'daily' },
      { url: '/about', priority: '0.5', changefreq: 'monthly' },
      { url: '/contact', priority: '0.5', changefreq: 'monthly' },
      { url: '/stores', priority: '0.5', changefreq: 'monthly' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    staticPages.forEach(p => {
      xml += `
  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`;
    });

    products.rows.forEach(p => {
      xml += `
  <url>
    <loc>${BASE_URL}/product/${p.id}</loc>
    <lastmod>${new Date(p.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += '\n</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
