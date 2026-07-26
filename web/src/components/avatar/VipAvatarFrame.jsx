import React from 'react';
import { Crown, Sparkles, Trophy, Award } from 'lucide-react';
import { getVipTier } from '@/lib/vip.js';

/**
 * VipAvatarFrame - Khung viền avatar theo cấp VIP
 * Mỗi tier có thiết kế khung riêng: gradient, ring, animation, badge overlay
 *
 * Props:
 *  - user: { name, avatar, totalSpent }
 *  - size: number (px) - mặc định 80
 *  - showBadge: boolean - có hiển thị badge VIP overlay (mặc định true)
 *  - showLevel: boolean - hiển thị số cấp (mặc định true)
 *  - onClick: function - click vào avatar
 *  - hoverEdit: ReactNode - nút hover (vd icon camera)
 *  - name: string - alt text
 */
export default function VipAvatarFrame({
  user,
  size = 80,
  showBadge = true,
  showLevel = true,
  onClick,
  hoverEdit,
  name,
  compact = false, // Ẩn crown/sparkles bên ngoài khi dùng trong danh sách nhỏ (timeline)
  className = '',
}) {
  const totalSpent = user?.totalSpent ?? 0;
  const safeUser = user || { name: 'U', avatar: null };
  const tier = getVipTier(totalSpent).current;

  const inner = (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Frame tier={tier} size={size}>
        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{ width: size, height: size }}
        >
          {safeUser?.avatar ? (
            <img
              src={safeUser.avatar.startsWith('http') ? safeUser.avatar : `http://localhost:5000${safeUser.avatar}`}
              alt={name || 'avatar'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-white font-bold bg-gradient-to-br ${tier.gradient}`}
              style={{ fontSize: size * 0.4 }}>
              {(safeUser?.name?.[0] || 'U').toUpperCase()}
            </div>
          )}
        </div>
      </Frame>

      {/* Level badge */}
      {showLevel && tier.id > 0 && (
        <div
          className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r ${tier.gradient} text-white text-[9px] font-black tracking-wider shadow-md border-2 border-white whitespace-nowrap`}
        >
          {tier.id === 10 ? 'MAX' : `LV.${tier.id}`}
        </div>
      )}

      {/* Indicator dot (online) */}
      <span
        className="absolute bottom-1 right-1 rounded-full bg-emerald-500 border-2 border-white shadow-sm"
        style={{ width: size * 0.18, height: size * 0.18 }}
      />

      {/* Hover edit overlay */}
      {hoverEdit && (
        <button
          onClick={onClick}
          className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
        >
          {hoverEdit}
        </button>
      )}
    </div>
  );

  return inner;
}

/**
 * Frame - Khung viền riêng cho từng tier
 * Tier 0: viền đơn giản
 * Tier 1-2: gradient ring
 * Tier 3-4: gradient ring + shimmer
 * Tier 5-6: animated gradient ring
 * Tier 7-8: glowing ring + rotating sparkle
 * Tier 9-10: animated gold ring + particles + crown
 */
function Frame({ tier, size, children }) {
  const inner = children;
  const sizeStyle = { width: size, height: size };

  switch (tier.id) {
    case 0: // Member - đơn giản
      return (
        <div className="absolute inset-0 rounded-full ring-2 ring-slate-200 bg-white shadow-sm" style={sizeStyle}>
          {inner}
        </div>
      );

    case 1: // VIP 1 - amber gradient ring
      return (
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 p-0.5 shadow-md shadow-amber-500/30" style={sizeStyle}>
          <div className="w-full h-full rounded-full bg-white p-0.5">
            {inner}
          </div>
        </div>
      );

    case 2: // VIP 2 - silver ring
      return (
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-zinc-300 via-zinc-400 to-zinc-600 p-0.5 shadow-md shadow-zinc-400/40" style={sizeStyle}>
          <div className="w-full h-full rounded-full bg-white p-0.5">
            {inner}
          </div>
        </div>
      );

    case 3: // VIP 3 - gold ring + shimmer
      return (
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 p-1 shadow-lg shadow-amber-500/40" style={sizeStyle}>
          <div className="w-full h-full rounded-full bg-white p-0.5">
            {inner}
          </div>
          {/* Shimmer */}
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.5)_50%,transparent_70%)] animate-shimmer" />
          </div>
        </div>
      );

    case 4: // VIP 4 - cyan ring
      return (
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-300 via-blue-400 to-cyan-600 p-1 shadow-lg shadow-cyan-500/40" style={sizeStyle}>
          <div className="w-full h-full rounded-full bg-white p-0.5">
            {inner}
          </div>
        </div>
      );

    case 5: // VIP 5 - animated sky ring
      return (
        <div
          className="absolute inset-0 rounded-full p-1 shadow-xl shadow-sky-500/40"
          style={{
            ...sizeStyle,
            background: 'conic-gradient(from 0deg, #38bdf8, #6366f1, #38bdf8, #818cf8, #38bdf8)',
            animation: 'spin 6s linear infinite',
          }}
        >
          <div className="w-full h-full rounded-full bg-white p-1">
            {inner}
          </div>
        </div>
      );

    case 6: // VIP 6 - emerald ring glow
      return (
        <div className="absolute inset-0 rounded-full shadow-xl shadow-emerald-500/50" style={{
          ...sizeStyle,
          background: 'linear-gradient(135deg, #34d399, #0d9488, #34d399)',
        }}>
          <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600">
            <div className="w-full h-full rounded-full bg-white p-0.5">
              {inner}
            </div>
          </div>
        </div>
      );

    case 7: // VIP 7 - rose ring + rotating sparkle
      return (
        <div className="absolute inset-0 rounded-full shadow-xl shadow-rose-500/50" style={sizeStyle}>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-400 via-pink-500 to-rose-600 p-1">
            <div className="w-full h-full rounded-full bg-white p-0.5">
              {inner}
            </div>
          </div>
          {!compact && (
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
              <Sparkles className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 text-rose-300 drop-shadow" />
              <Sparkles className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 text-pink-300 drop-shadow" />
              <Sparkles className="absolute top-1/2 -left-1 -translate-y-1/2 w-2.5 h-2.5 text-rose-400 drop-shadow" />
              <Sparkles className="absolute top-1/2 -right-1 -translate-y-1/2 w-2.5 h-2.5 text-pink-400 drop-shadow" />
            </div>
          )}
        </div>
      );

    case 8: // VIP 8 - indigo sapphire ring + glow
      return (
        <div className="absolute inset-0 rounded-full shadow-2xl" style={{
          ...sizeStyle,
          background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899, #6366f1)',
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 4s ease infinite',
        }}>
          <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
            <div className="w-full h-full rounded-full bg-white p-0.5">
              {inner}
            </div>
          </div>
          {/* Inner glow */}
          {!compact && <div className="absolute inset-0 rounded-full ring-2 ring-purple-300/50 blur-[2px]" />}
        </div>
      );

    case 9: // VIP 9 - Black Diamond ring + crown
      return (
        <div className="absolute inset-0 rounded-full shadow-2xl shadow-amber-700/60" style={sizeStyle}>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neutral-700 via-neutral-900 to-amber-700 p-1">
            <div className="w-full h-full rounded-full bg-neutral-950 p-0.5">
              {inner}
            </div>
          </div>
          {!compact && (
            <>
              <div className="absolute -inset-1 rounded-full border-2 border-amber-400/40 animate-pulse" />
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                <Crown className="w-5 h-5" fill="currentColor" />
              </div>
              <Sparkles className="absolute top-1 right-0 w-3 h-3 text-amber-300 animate-pulse" />
              <Sparkles className="absolute bottom-1 left-0 w-2.5 h-2.5 text-amber-400 animate-pulse" />
            </>
          )}
        </div>
      );

    case 10: // VIP 10 - Royal Legend - animated gold ring + particles
      return (
        <div className="absolute inset-0 rounded-full shadow-2xl shadow-amber-500/60" style={sizeStyle}>
          {/* Animated gold gradient ring */}
          <div className="absolute inset-0 rounded-full p-1.5"
            style={{
              background: 'conic-gradient(from 0deg, #fbbf24, #f59e0b, #d97706, #fbbf24, #fcd34d, #f59e0b, #fbbf24)',
              animation: 'spin 4s linear infinite',
            }}>
            <div className="w-full h-full rounded-full bg-gradient-to-br from-neutral-950 via-neutral-900 to-amber-950 p-0.5">
              <div className="w-full h-full rounded-full bg-neutral-950 p-0.5">
                {inner}
              </div>
            </div>
          </div>
          {!compact && (
            <>
              <div className="absolute -inset-2 rounded-full bg-amber-400/20 blur-md animate-pulse" />
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-amber-300 drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)]">
                <Crown className="w-6 h-6" fill="currentColor" strokeWidth={0} />
              </div>
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '10s' }}>
                <Sparkles className="absolute -top-1 left-1/2 -translate-x-1/2 w-3.5 h-3.5 text-amber-300" fill="currentColor" />
                <Sparkles className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 text-yellow-300" fill="currentColor" />
                <Sparkles className="absolute top-1/2 -left-2 -translate-y-1/2 w-3 h-3 text-amber-200" fill="currentColor" />
                <Sparkles className="absolute top-1/2 -right-2 -translate-y-1/2 w-3 h-3 text-amber-400" fill="currentColor" />
                <Sparkles className="absolute top-1 -right-1 w-2 h-2 text-yellow-200" fill="currentColor" />
                <Sparkles className="absolute bottom-1 -left-1 w-2.5 h-2.5 text-amber-200" fill="currentColor" />
              </div>
              <div className="absolute bottom-0 right-0 translate-x-1 translate-y-1 bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950 rounded-full p-0.5 shadow-lg border-2 border-neutral-950">
                <Trophy className="w-3 h-3" />
              </div>
            </>
          )}
        </div>
      );

    default:
      return <div className="absolute inset-0 rounded-full" style={sizeStyle}>{inner}</div>;
  }
}