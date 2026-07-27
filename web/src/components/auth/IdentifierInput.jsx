import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const EMAIL_DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com'];

// Đầu số di động Việt Nam phổ biến (theo thứ tự phổ biến)
const PHONE_PREFIXES = [
  '090', '091', '094', // Mobifone
  '083', '084', '085', '081', '082', // Vinaphone
  '088', // Vinaphone (MyNumber)
  '032', '033', '034', '035', '036', '037', '038', '039', // Viettel
  '070', '076', '077', '078', '079', // Mobi/Vina
  '056', '058', // Vietnamobile
];

function buildEmailSuggestions(input) {
  const trimmed = (input || '').trim().toLowerCase();
  if (!trimmed || trimmed.includes('@')) return [];
  const local = trimmed.split(/\s+/)[0];
  if (!local) return [];
  return EMAIL_DOMAINS.map((d) => ({ value: `${local}@${d}`, display: `${local}@${d}`, hint: d }));
}

function buildPhoneSuggestions(input) {
  const digits = (input || '').replace(/\D/g, '');
  if (digits.length === 0 || digits.length > 2) return [];
  return PHONE_PREFIXES
    .filter((p) => p.startsWith(digits))
    .slice(0, 8)
    .map((p) => ({ value: p, display: p, hint: 'Đầu số VN' }));
}

export default function IdentifierInput({
  method = 'email',
  onMethodChange,
  value,
  onChange,
  disabled = false,
  autoFocus = false,
  inputId = 'identifier-input',
  inputClassName = '',
  wrapperClassName = '',
}) {
  const [showSuggest, setShowSuggest] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const suggestions = method === 'email'
    ? buildEmailSuggestions(value)
    : buildPhoneSuggestions(value);

  useEffect(() => {
    if (suggestions.length === 0) {
      setShowSuggest(false);
      setActiveIndex(-1);
    }
  }, [suggestions.length]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggest(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const raw = e.target.value;
    let next = raw;
    if (method === 'phone') {
      next = raw.replace(/\D/g, '').slice(0, 10);
    } else {
      next = raw.replace(/\s+/g, '');
    }
    onChange?.(next);
    setShowSuggest(true);
    setActiveIndex(-1);
  };

  const handleSelect = (s) => {
    onChange?.(s.value);
    setShowSuggest(false);
    setActiveIndex(-1);
    requestAnimationFrame(() => {
      const v = s.value;
      const len = v.length;
      try { inputRef.current?.setSelectionRange?.(len, len); } catch { /* noop */ }
      inputRef.current?.focus?.();
    });
  };

  const handleKeyDown = (e) => {
    if (!showSuggest || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggest(false);
      setActiveIndex(-1);
    }
  };

  const switchMethod = (m) => {
    if (m === method) return;
    onChange?.('');
    onMethodChange?.(m);
    setShowSuggest(false);
    setActiveIndex(-1);
    setTimeout(() => inputRef.current?.focus?.(), 0);
  };

  const inputType = method === 'email' ? 'email' : 'tel';
  const inputMode = method === 'phone' ? 'numeric' : undefined;
  const maxLength = method === 'phone' ? 10 : undefined;
  const placeholder = method === 'email' ? 'ten@gmail.com' : '0912345678';

  return (
    <div className={cn('space-y-2', wrapperClassName)} ref={wrapperRef}>
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        {[
          { key: 'email', label: 'Gmail' },
          { key: 'phone', label: 'SĐT' },
        ].map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => switchMethod(opt.key)}
            disabled={disabled}
            className={cn(
              'flex-1 py-2 rounded-md text-sm font-medium transition-all',
              method === opt.key ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="space-y-1 relative">
        <Label htmlFor={inputId}>{method === 'email' ? 'Email' : 'Số điện thoại'}</Label>
        <Input
          id={inputId}
          ref={inputRef}
          type={inputType}
          inputMode={inputMode}
          maxLength={maxLength}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => { if (suggestions.length > 0) setShowSuggest(true); }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete="off"
          className={inputClassName}
        />

        {showSuggest && suggestions.length > 0 && (
          <ul
            role="listbox"
            className="absolute z-50 left-0 right-0 mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {suggestions.map((s, i) => (
              <li
                key={s.value}
                role="option"
                aria-selected={i === activeIndex}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
                onMouseEnter={() => setActiveIndex(i)}
                className={cn(
                  'px-3 py-2 text-sm cursor-pointer flex justify-between items-center gap-2',
                  i === activeIndex ? 'bg-primary/10 text-foreground' : 'hover:bg-muted'
                )}
              >
                <span className="font-medium">{s.display}</span>
                <span className="text-xs text-muted-foreground">{s.hint}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}