// VIP tier system — 10 cấp dựa trên tổng chi tiêu (VNĐ)
// Mỗi tier có 5 ưu đãi cốt lõi:
//   1. discount: % giảm giá trên đơn
//   2. freeShip: miễn phí vận chuyển từ đơn tối thiểu (VNĐ, Infinity = mọi đơn)
//   3. pointsMultiplier: hệ số điểm thưởng (x1, x1.5, x2, x3)
//   4. birthdayGift: quà/điểm tặng sinh nhật (VNĐ hoặc 0 = không có)
//   5. prioritySupport: cấp độ ưu tiên CSKH (0 = thường, 1 = nhanh, 2 = VIP riêng, 3 = 24/7)

export const VIP_TIERS = [
  {
    id: 0,
    key: 'member',
    name: 'Member',
    label: 'Thành viên',
    minSpent: 0,
    color: 'slate',
    gradient: 'from-slate-400 to-slate-600',
    ring: 'ring-slate-300',
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: 'User',
    perks: {
      discount: 0,
      freeShip: 500000,
      pointsMultiplier: 1,
      birthdayGift: 0,
      prioritySupport: 0,
    },
    benefits: [
      'Tích điểm cơ bản x1',
      'Free ship đơn từ 500k',
      'Nhận thông báo sale sớm 24h',
    ],
  },
  {
    id: 1,
    key: 'vip1',
    name: 'VIP 1',
    label: 'Khởi đầu',
    minSpent: 1000000,
    color: 'amber',
    gradient: 'from-amber-400 to-amber-600',
    ring: 'ring-amber-300',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: 'Sparkles',
    perks: {
      discount: 3,
      freeShip: 300000,
      pointsMultiplier: 1.25,
      birthdayGift: 50000,
      prioritySupport: 1,
    },
    benefits: [
      'Giảm 3% mọi đơn hàng',
      'Free ship đơn từ 300k',
      'Tích điểm x1.25',
      'Quà sinh nhật 50k',
      'CSKH phản hồi trong 24h',
    ],
  },
  {
    id: 2,
    key: 'vip2',
    name: 'VIP 2',
    label: 'Bạc',
    minSpent: 3000000,
    color: 'zinc',
    gradient: 'from-zinc-400 to-zinc-600',
    ring: 'ring-zinc-300',
    bg: 'bg-zinc-50',
    text: 'text-zinc-700',
    border: 'border-zinc-200',
    icon: 'Star',
    perks: {
      discount: 5,
      freeShip: 200000,
      pointsMultiplier: 1.5,
      birthdayGift: 100000,
      prioritySupport: 1,
    },
    benefits: [
      'Giảm 5% mọi đơn hàng',
      'Free ship đơn từ 200k',
      'Tích điểm x1.5',
      'Quà sinh nhật 100k',
      'CSKH phản hồi trong 24h',
    ],
  },
  {
    id: 3,
    key: 'vip3',
    name: 'VIP 3',
    label: 'Vàng',
    minSpent: 7000000,
    color: 'yellow',
    gradient: 'from-yellow-400 to-amber-600',
    ring: 'ring-yellow-300',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    icon: 'Crown',
    perks: {
      discount: 7,
      freeShip: 0,
      pointsMultiplier: 1.75,
      birthdayGift: 200000,
      prioritySupport: 2,
    },
    benefits: [
      'Giảm 7% mọi đơn hàng',
      'Free ship không điều kiện',
      'Tích điểm x1.75',
      'Quà sinh nhật 200k',
      'CSKH ưu tiên riêng',
    ],
  },
  {
    id: 4,
    key: 'vip4',
    name: 'VIP 4',
    label: 'Bạch Kim',
    minSpent: 15000000,
    color: 'cyan',
    gradient: 'from-cyan-400 to-blue-600',
    ring: 'ring-cyan-300',
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    icon: 'Gem',
    perks: {
      discount: 10,
      freeShip: 0,
      pointsMultiplier: 2,
      birthdayGift: 300000,
      prioritySupport: 2,
    },
    benefits: [
      'Giảm 10% mọi đơn hàng',
      'Free ship không điều kiện',
      'Tích điểm x2',
      'Quà sinh nhật 300k',
      'CSKH ưu tiên riêng',
    ],
  },
  {
    id: 5,
    key: 'vip5',
    name: 'VIP 5',
    label: 'Kim Cương',
    minSpent: 30000000,
    color: 'sky',
    gradient: 'from-sky-400 to-indigo-600',
    ring: 'ring-sky-300',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    icon: 'Diamond',
    perks: {
      discount: 12,
      freeShip: 0,
      pointsMultiplier: 2.25,
      birthdayGift: 500000,
      prioritySupport: 3,
    },
    benefits: [
      'Giảm 12% mọi đơn hàng',
      'Free ship không điều kiện',
      'Tích điểm x2.25',
      'Quà sinh nhật 500k',
      'Hỗ trợ 24/7 riêng',
    ],
  },
  {
    id: 6,
    key: 'vip6',
    name: 'VIP 6',
    label: 'Lục Bảo',
    minSpent: 60000000,
    color: 'emerald',
    gradient: 'from-emerald-400 to-teal-600',
    ring: 'ring-emerald-300',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: 'Hexagon',
    perks: {
      discount: 15,
      freeShip: 0,
      pointsMultiplier: 2.5,
      birthdayGift: 800000,
      prioritySupport: 3,
    },
    benefits: [
      'Giảm 15% mọi đơn hàng',
      'Free ship không điều kiện + đóng gói quà',
      'Tích điểm x2.5',
      'Quà sinh nhật 800k',
      'Hỗ trợ 24/7 riêng',
    ],
  },
  {
    id: 7,
    key: 'vip7',
    name: 'VIP 7',
    label: 'Hồng Ngọc',
    minSpent: 120000000,
    color: 'rose',
    gradient: 'from-rose-400 to-pink-600',
    ring: 'ring-rose-300',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: 'Trophy',
    perks: {
      discount: 18,
      freeShip: 0,
      pointsMultiplier: 2.75,
      birthdayGift: 1200000,
      prioritySupport: 3,
    },
    benefits: [
      'Giảm 18% mọi đơn hàng',
      'Free ship + đóng gói quà cao cấp',
      'Tích điểm x2.75',
      'Quà sinh nhật 1.2tr',
      'Hỗ trợ 24/7 riêng',
    ],
  },
  {
    id: 8,
    key: 'vip8',
    name: 'VIP 8',
    label: 'Sapphire',
    minSpent: 250000000,
    color: 'indigo',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    ring: 'ring-indigo-300',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    icon: 'Award',
    perks: {
      discount: 22,
      freeShip: 0,
      pointsMultiplier: 3,
      birthdayGift: 2000000,
      prioritySupport: 3,
    },
    benefits: [
      'Giảm 22% mọi đơn hàng',
      'Free ship + đóng gói quà VIP',
      'Tích điểm x3',
      'Quà sinh nhật 2tr',
      'Quản lý tài khoản riêng',
    ],
  },
  {
    id: 9,
    key: 'vip9',
    name: 'VIP 9',
    label: 'Black Diamond',
    minSpent: 500000000,
    color: 'neutral',
    gradient: 'from-neutral-700 via-neutral-900 to-amber-700',
    ring: 'ring-neutral-500',
    bg: 'bg-neutral-900',
    text: 'text-amber-300',
    border: 'border-neutral-700',
    icon: 'Crown',
    perks: {
      discount: 25,
      freeShip: 0,
      pointsMultiplier: 3.5,
      birthdayGift: 3000000,
      prioritySupport: 3,
    },
    benefits: [
      'Giảm 25% mọi đơn hàng',
      'Free ship + đóng gói quà Bespoke',
      'Tích điểm x3.5',
      'Quà sinh nhật 3tr',
      'Stylist tư vấn riêng',
    ],
  },
  {
    id: 10,
    key: 'vip10',
    name: 'VIP 10',
    label: 'Royal Legend',
    minSpent: 1000000000,
    color: 'gold',
    gradient: 'from-amber-300 via-amber-500 to-yellow-600',
    ring: 'ring-amber-400',
    bg: 'bg-gradient-to-br from-neutral-950 to-amber-950',
    text: 'text-amber-300',
    border: 'border-amber-500',
    icon: 'Sparkles',
    perks: {
      discount: 30,
      freeShip: 0,
      pointsMultiplier: 5,
      birthdayGift: 5000000,
      prioritySupport: 3,
    },
    benefits: [
      'Giảm 30% mọi đơn hàng',
      'Free ship + đóng gói Bespoke + tặng kèm phụ kiện',
      'Tích điểm x5',
      'Quà sinh nhật 5tr + thiệp tay',
      'Stylist + quản lý 24/7',
      'Tham gia sự kiện riêng',
    ],
  },
];

// Lấy tier hiện tại dựa trên tổng chi tiêu
export function getVipTier(totalSpent = 0) {
  let current = VIP_TIERS[0];
  let next = null;
  for (let i = 0; i < VIP_TIERS.length; i++) {
    if (totalSpent >= VIP_TIERS[i].minSpent) {
      current = VIP_TIERS[i];
      next = VIP_TIERS[i + 1] || null;
    }
  }
  return { current, next, all: VIP_TIERS };
}

// Tính % progress tới tier kế tiếp
export function getTierProgress(totalSpent = 0) {
  const { current, next } = getVipTier(totalSpent);
  if (!next) return { current, next: null, progress: 100, remaining: 0 };
  const span = next.minSpent - current.minSpent;
  const used = Math.max(0, totalSpent - current.minSpent);
  const progress = Math.min(100, Math.round((used / span) * 100));
  const remaining = Math.max(0, next.minSpent - totalSpent);
  return { current, next, progress, remaining };
}

// Format tiền VNĐ gọn (1tr, 500k, 1.2tr)
export function formatVndShort(value = 0) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}tr`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return `${value}`;
}

// Format đầy đủ kiểu Việt Nam
export function formatVnd(value = 0) {
  return value.toLocaleString('vi-VN') + '₫';
}