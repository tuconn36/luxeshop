import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext.jsx';
import { cn } from '@/lib/utils';

export default function WishlistButton({ productId, className, size = 'default' }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(productId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(productId);
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    default: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    default: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'rounded-full border bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-200 flex items-center justify-center group',
        sizeClasses[size],
        className
      )}
      title={inWishlist ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
    >
      <Heart
        className={cn(
          'transition-all duration-200',
          iconSizes[size],
          inWishlist
            ? 'fill-red-500 text-red-500'
            : 'text-gray-600 group-hover:text-red-500 group-hover:scale-110'
        )}
      />
    </button>
  );
}
