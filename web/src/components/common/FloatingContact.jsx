import React, { useState } from 'react';
import { Phone, Mail, MapPin, X, MessageCircle } from 'lucide-react';

const CONTACT_OPTIONS = [
  {
    key: 'hotline',
    label: 'HOTLINE',
    description: '+84 865577745',
    icon: Phone,
    color: 'bg-[#E53935] hover:bg-[#c62828]',
    iconBg: 'bg-white/15',
    href: 'tel:+84 865577745',
  },
  {
    key: 'zalo',
    label: 'TƯ VẤN QUA ZALO',
    description: 'Chat nhanh qua Zalo',
    icon: MessageCircle,
    color: 'bg-[#0068FF] hover:bg-[#0054cc]',
    iconBg: 'bg-white/15',
    href: 'https://zalo.me/84987799353',
  },
  {
    key: 'email',
    label: 'LIÊN HỆ QUA EMAIL',
    description: 'support@luxe.vn',
    icon: Mail,
    color: 'bg-[#3DA5E0] hover:bg-[#2c8ec4]',
    iconBg: 'bg-white/15',
    href: 'mailto:support@luxe.vn',
  },
  {
    key: 'store',
    label: 'CỬA HÀNG',
    description: 'Xem hệ thống cửa hàng',
    icon: MapPin,
    color: 'bg-[#F5A623] hover:bg-[#db8e15]',
    iconBg: 'bg-white/15',
    href: '/stores',
  },
];

export default function FloatingContact() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-end gap-3">
      {open && (
        <div className="relative w-72 rounded-2xl bg-white shadow-2xl border border-border/40 overflow-hidden animate-in fade-in slide-in-from-right-3 duration-200">
          {/* Close button ở góc trên bên phải của panel */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-foreground/80 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>

          <ul className="py-2">
            {CONTACT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isInternal = opt.href.startsWith('/');
              return (
                <li key={opt.key}>
                  <a
                    href={opt.href}
                    target={isInternal ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 mx-2 my-1 px-3 py-3 rounded-xl text-white transition-colors ${opt.color}`}
                  >
                    <span
                      className={`w-10 h-10 rounded-full ${opt.iconBg} flex items-center justify-center shrink-0`}
                    >
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="flex flex-col leading-tight">
                      <span className="text-sm font-bold tracking-wide">
                        {opt.label}
                      </span>
                      <span className="text-[11px] text-white/85">
                        {opt.description}
                      </span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Nút toggle tròn ở góc */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
          open
            ? 'bg-foreground text-background rotate-90'
            : 'bg-[#E53935] text-white hover:scale-105'
        }`}
        aria-label={open ? 'Đóng liên hệ' : 'Mở liên hệ'}
      >
        {open ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            <span className="absolute inset-0 rounded-full animate-ping bg-[#E53935]/40 pointer-events-none" />
          </>
        )}
      </button>
    </div>
  );
}