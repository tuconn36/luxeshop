import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

// Định dạng tiền VNĐ chuẩn Việt Nam: "59.900.000 ₫"
export const formatVND = (amount) => {
	const value = Number(amount) || 0;
	return new Intl.NumberFormat('vi-VN').format(value) + '₫';
};

// Định dạng gọn cho biểu đồ/card: 1tr, 500k, 1.2tỷ
export const formatVNDShort = (amount) => {
	const value = Number(amount) || 0;
	if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}tỷ`;
	if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}tr`;
	if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
	return `${value}`;
};
