import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { statsAPI } from '@/lib/api.js';
import { VIP_TIERS, getTierProgress, formatVndShort, formatVnd } from '@/lib/vip.js';
import {
  Sparkles, Crown, Lock, Gift, Truck, Percent, Headphones,
  ChevronRight, Trophy,
} from 'lucide-react';

export default function VipPage() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!currentUser?.id) return;
    statsAPI.getUserStats(currentUser.id).then(setStats).catch(() => setStats(null));
  }, [currentUser?.id]);

  const totalSpent = stats?.totalSpent ?? 0;
  const { current, next, progress, remaining } = getTierProgress(totalSpent);
  const isMaxTier = !next;

  // 5 perks inline (gộp chung 1 dải)
  const perks = [
    { icon: Percent, label: 'Giảm giá', value: current.perks.discount > 0 ? `${current.perks.discount}%` : '—', active: current.perks.discount > 0 },
    { icon: Truck, label: 'Free ship', value: current.perks.freeShip === 0 ? 'Mọi đơn' : `Từ ${formatVndShort(current.perks.freeShip)}`, active: current.perks.freeShip === 0 },
    { icon: Sparkles, label: 'Điểm', value: `x${current.perks.pointsMultiplier}`, active: current.perks.pointsMultiplier > 1 },
    { icon: Gift, label: 'Quà SN', value: current.perks.birthdayGift > 0 ? formatVndShort(current.perks.birthdayGift) : '—', active: current.perks.birthdayGift > 0 },
    { icon: Headphones, label: 'CSKH', value: ['Thường','24h','Ưu tiên','24/7 VIP'][current.perks.prioritySupport] || '—', active: current.perks.prioritySupport > 0 },
  ];

  return (
    <>
      <Helmet><title>Hạng VIP - LUXE</title></Helmet>

      <div className="space-y-5">
        {/* HERO COMPACT — tier hiện tại + 5 perks inline */}
        <div className={`relative overflow-hidden rounded-2xl shadow-xl border ${
          current.id === 0 ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border-slate-700'
          : current.id === 10 ? 'bg-gradient-to-br from-neutral-950 via-amber-950 to-neutral-950 border-amber-500/40'
          : `bg-gradient-to-br ${current.gradient} border-white/20`
        }`}>
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.4),transparent_40%)]" />
          <div className="absolute -top-8 -right-8 text-white/15">
            <Sparkles className="w-40 h-40" strokeWidth={0.8} />
          </div>

          <div className="relative p-6 text-white">
            <div className="flex items-center gap-4 mb-5">
              <div className="relative shrink-0 w-16 h-16 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-xl font-bold text-white">
                {currentUser?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-[9px] font-bold tracking-[0.2em] uppercase backdrop-blur">
                  <Crown className="w-2.5 h-2.5" />
                  Hạng của bạn
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight drop-shadow-md leading-tight">
                    {current.name}
                  </h1>
                  <span className="text-white/70 text-xs">· {current.label}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[9px] tracking-[0.2em] uppercase text-white/60 font-semibold">Tổng chi</p>
                <p className="font-serif text-lg md:text-xl font-bold">{formatVnd(totalSpent)}</p>
              </div>
            </div>

            {/* Progress bar compact */}
            <div className="mb-4">
              <div className="flex justify-between text-[10px] text-white/80 mb-1">
                <span className="font-semibold">{current.name}</span>
                {next && <span className="font-semibold">{next.name}</span>}
              </div>
              <div className="relative h-2 rounded-full bg-white/15 overflow-hidden border border-white/10">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-white via-amber-200 to-white rounded-full transition-all duration-1000 shadow"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-white/80 mt-1.5 flex items-center gap-2">
                {next ? (
                  <>
                    Còn <span className="font-bold text-white">{formatVndShort(remaining)}</span>
                    để lên <span className="font-bold text-white">{next.name}</span>
                    <span className="ml-auto px-1.5 py-0.5 rounded bg-white/15 font-bold">{progress}%</span>
                  </>
                ) : (
                  <span className="text-amber-200 flex items-center gap-1"><Trophy className="w-3 h-3" /> Cấp tối đa — bạn là huyền thoại LUXE!</span>
                )}
              </p>
            </div>

            {/* 5 perks inline */}
            <div className="grid grid-cols-5 gap-2">
              {perks.map((p, i) => (
                <div
                  key={i}
                  className={`rounded-xl px-2 py-2 text-center backdrop-blur border ${
                    p.active ? 'bg-white/15 border-white/20' : 'bg-white/5 border-white/10 opacity-50'
                  }`}
                >
                  <p.icon className={`w-3.5 h-3.5 mx-auto mb-0.5 ${p.active ? 'text-white' : 'text-white/50'}`} />
                  <p className="text-[8px] tracking-wider uppercase text-white/60 font-semibold leading-tight">{p.label}</p>
                  <p className="font-bold text-[11px] mt-0.5 text-white truncate">{p.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* LADDER HORIZONTAL — 10 tier dạng timeline ngắn gọn */}
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              10 cấp độ thành viên
            </h2>
            <p className="text-[10px] text-neutral-500">Tích lũy chi tiêu để thăng hạng</p>
          </div>

          {/* Horizontal scrollable timeline */}
          <div className="-mx-2 px-2 pt-4 pb-3" style={{ overflowX: 'auto', overflowY: 'visible' }}>
            <div className="flex gap-2 min-w-max">
              {VIP_TIERS.map((tier) => {
                const isCurrent = tier.id === current.id;
                const isUnlocked = totalSpent >= tier.minSpent;
                const isNext = next && tier.id === next.id;

                return (
                  <div
                    key={tier.id}
                    className={`shrink-0 w-32 rounded-xl border-2 p-3 relative transition-all ${
                      isCurrent
                        ? `border-current ${tier.bg} shadow-lg scale-105`
                        : isUnlocked
                        ? 'border-emerald-300 bg-emerald-50/30'
                        : isNext
                        ? 'border-amber-400 bg-amber-50/50 border-dashed'
                        : 'border-neutral-200 bg-neutral-50 opacity-60'
                    }`}
                  >
                    {isCurrent && (
                      <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r ${tier.gradient} text-white text-[9px] font-black tracking-wider shadow whitespace-nowrap z-10`}>
                        HIỆN TẠI
                      </span>
                    )}
                    {isNext && !isCurrent && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black tracking-wider shadow whitespace-nowrap z-10">
                        KẾ TIẾP
                      </span>
                    )}
                    {!isUnlocked && !isNext && (
                      <Lock className="absolute top-2 right-2 w-3 h-3 text-neutral-300" />
                    )}

                    {/* Mini avatar preview */}
                    <div className="flex justify-center mb-2">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${
                        isUnlocked ? `bg-gradient-to-br ${tier.gradient}` : 'bg-neutral-300 text-neutral-500'
                      }`}>
                        {tier.id === 0 ? 'M' : tier.id}
                      </div>
                    </div>

                    <p className={`text-xs font-bold text-center leading-tight ${isCurrent ? tier.text : isUnlocked ? 'text-emerald-700' : 'text-neutral-500'}`}>
                      {tier.name}
                    </p>
                    <p className="text-[10px] text-center text-neutral-500 mt-0.5">{tier.label}</p>
                    <p className="text-[10px] text-center font-semibold mt-1.5 text-neutral-700">
                      {formatVndShort(tier.minSpent)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* COMPACT CTA */}
        <Link
          to="/"
          className="flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-50 to-rose-50 dark:from-neutral-900 dark:to-amber-950/30 border border-amber-200/50 dark:border-amber-500/20 px-5 py-3.5 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm font-semibold">Tiếp tục mua sắm để thăng hạng</p>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </>
  );
}