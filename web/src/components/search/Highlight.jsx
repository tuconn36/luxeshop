import React from 'react';
import { splitByMatch } from '@/lib/search';

/**
 * Highlight các từ khớp trong text.
 *
 * @param {string} text
 * @param {string} query
 * @param {string} className - class cho <mark>
 */
export default function Highlight({ text, query, className = 'bg-amber-200 dark:bg-amber-500/30 text-amber-900 dark:text-amber-200 px-0.5 rounded' }) {
  if (!text) return null;
  const segments = splitByMatch(text, query);
  return (
    <>
      {segments.map((seg, i) =>
        seg.isMatch ? (
          <mark key={i} className={className}>
            {seg.text}
          </mark>
        ) : (
          <React.Fragment key={i}>{seg.text}</React.Fragment>
        )
      )}
    </>
  );
}
