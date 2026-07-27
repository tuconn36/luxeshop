// Highlight text khớp với query - dùng cho search results
// Trả về JSX với <mark> bao quanh phần khớp

import React from 'react';

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Normalize text giống backend
function normalizeText(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenizeQuery(search) {
  if (!search) return [];
  const normalized = normalizeText(search);
  if (!normalized) return [];
  return normalized.split(' ').filter((t) => t.length >= 2);
}

export function highlightMatch(text, query, className = 'bg-amber-200 text-amber-900 rounded px-0.5') {
  if (!text || !query) return text;

  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return text;

  const textStr = String(text);
  const lowerText = textStr.toLowerCase();
  // Map từng vị trí ký tự trong lowerText → vị trí trong textStr (giữ nguyên dấu)
  // Đơn giản: chỉ highlight khi match exact (không bỏ dấu) để tránh sai lệch.
  // Nếu muốn bỏ dấu, cần map index phức tạp hơn.

  // Tìm tất cả các match
  const matches = [];
  for (const token of tokens) {
    const escaped = escapeRegex(token);
    const re = new RegExp(escaped, 'gi');
    let m;
    while ((m = re.exec(textStr)) !== null) {
      matches.push({ start: m.index, end: m.index + m[0].length });
    }
  }

  if (matches.length === 0) return text;

  // Sort & merge overlapping
  matches.sort((a, b) => a.start - b.start);
  const merged = [];
  for (const m of matches) {
    if (merged.length > 0 && m.start <= merged[merged.length - 1].end) {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, m.end);
    } else {
      merged.push({ ...m });
    }
  }

  // Build JSX
  const parts = [];
  let cursor = 0;
  merged.forEach((m, i) => {
    if (m.start > cursor) {
      parts.push(<React.Fragment key={`t-${i}`}>{textStr.slice(cursor, m.start)}</React.Fragment>);
    }
    parts.push(
      <mark key={`m-${i}`} className={className}>
        {textStr.slice(m.start, m.end)}
      </mark>
    );
    cursor = m.end;
  });
  if (cursor < textStr.length) {
    parts.push(<React.Fragment key="end">{textStr.slice(cursor)}</React.Fragment>);
  }

  return <>{parts}</>;
}
