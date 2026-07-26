/**
 * Tiện ích tìm kiếm thông minh, hỗ trợ:
 * - Fuzzy match với Levenshtein distance
 * - Highlight match trong text
 * - Search nhiều trường (name, description, brand, tags, category)
 * - Tính điểm relevance
 */

/**
 * Tính khoảng cách Levenshtein giữa 2 chuỗi.
 * Số lần edit (insert, delete, replace) tối thiểu để biến a → b.
 */
export function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j - 1][i] + 1, // delete
        matrix[j][i - 1] + 1, // insert
        matrix[j - 1][i - 1] + cost, // replace
      );
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Tính điểm match giữa query và text.
 * Trả về 0 nếu không khớp, càng cao càng tốt.
 *
 * - Exact match: 100
 * - Starts with: 80
 * - Contains: 60
 * - Fuzzy (1-2 ký tự sai): 30-50
 */
export function matchScore(query, text) {
  if (!query || !text) return 0;
  const q = query.toLowerCase().trim();
  const t = text.toLowerCase();

  if (q === t) return 100;
  if (t.startsWith(q)) return 80;

  const idx = t.indexOf(q);
  if (idx >= 0) {
    // Bonus nếu match ở đầu từ
    const wordStart = idx === 0 || /[\s\-_]/.test(t[idx - 1]);
    return wordStart ? 65 : 55;
  }

  // Fuzzy match: tìm substring gần giống q
  // Chia text thành các từ rồi so sánh
  const words = t.split(/[\s\-_]+/);
  let bestScore = 0;
  for (const word of words) {
    if (word.length < 2) continue;
    if (q.length < 2) continue;
    const dist = levenshtein(q, word.slice(0, Math.max(q.length, word.length)));
    const maxLen = Math.max(q.length, word.length);
    const similarity = 1 - dist / maxLen;
    if (similarity >= 0.7) {
      bestScore = Math.max(bestScore, similarity * 50);
    }
    // Nếu q ngắn hơn, thử substring
    if (q.length <= word.length) {
      for (let i = 0; i <= word.length - q.length; i++) {
        const sub = word.slice(i, i + q.length);
        const subDist = levenshtein(q, sub);
        const subSim = 1 - subDist / q.length;
        if (subSim >= 0.75) {
          bestScore = Math.max(bestScore, subSim * 40);
        }
      }
    }
  }
  return bestScore;
}

/**
 * Tìm tất cả các vị trí match trong text.
 * Trả về mảng các segment: { text, isMatch }
 *
 * @param {string} text
 * @param {string} query
 * @returns {Array<{text: string, isMatch: boolean}>}
 */
export function splitByMatch(text, query) {
  if (!text || !query) return [{ text, isMatch: false }];
  const q = query.trim();
  if (!q) return [{ text, isMatch: false }];

  const lowerText = text.toLowerCase();
  const lowerQ = q.toLowerCase();
  const segments = [];
  let cursor = 0;

  while (cursor < text.length) {
    const idx = lowerText.indexOf(lowerQ, cursor);
    if (idx < 0) {
      segments.push({ text: text.slice(cursor), isMatch: false });
      break;
    }
    if (idx > cursor) {
      segments.push({ text: text.slice(cursor, idx), isMatch: false });
    }
    segments.push({ text: text.slice(idx, idx + q.length), isMatch: true });
    cursor = idx + q.length;
  }
  return segments;
}

/**
 * Tính tổng điểm cho sản phẩm dựa trên nhiều trường.
 */
export function scoreProduct(product, query) {
  if (!query) return 0;
  const fields = [
    { text: product.name, weight: 3 },
    { text: product.brand, weight: 2 },
    { text: product.category, weight: 1.5 },
    { text: product.description, weight: 1 },
    { text: product.tags && product.tags.join(' '), weight: 1.2 },
  ];

  let total = 0;
  for (const { text, weight } of fields) {
    if (!text) continue;
    total += matchScore(query, text) * weight;
  }
  return total;
}

/**
 * Filter & sort danh sách sản phẩm theo query.
 */
export function searchProducts(products, query, limit = 10) {
  if (!query || !query.trim()) return [];
  return products
    .map((p) => ({ product: p, score: scoreProduct(p, query) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.product);
}

/**
 * Gợi ý các từ khóa phổ biến từ products (cho autocomplete).
 */
export function getSuggestions(products, query, limit = 5) {
  if (!query || !products.length) return [];
  const q = query.toLowerCase().trim();
  const words = new Set();
  for (const p of products) {
    const sources = [p.name, p.brand, p.category];
    for (const text of sources) {
      if (!text) continue;
      const tokens = text.toLowerCase().split(/[\s\-_]+/);
      for (const t of tokens) {
        if (t.length >= 2 && t.startsWith(q.slice(0, 1))) {
          words.add(t);
        }
      }
    }
  }
  return Array.from(words).slice(0, limit);
}
