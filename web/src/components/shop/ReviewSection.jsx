import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Image as ImageIcon, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { reviewsAPI } from '@/lib/api.js';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

function StarRating({ value, onChange, readonly = false, size = 'default' }) {
  const [hovered, setHovered] = useState(0);
  const sz = size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={readonly ? 'button' : 'button'}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}
          disabled={readonly}
        >
          <Star
            className={`${sz} transition-colors ${
              star <= (hovered || value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewItem({ review }) {
  const [helpful, setHelpful] = useState(review.helpful_count || 0);
  const [voted, setVoted] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);
  const avatarUrl = review.avatar
    ? (review.avatar.startsWith('http') ? review.avatar : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${review.avatar}`)
    : null;

  const images = Array.isArray(review.images) ? review.images : [];

  return (
    <div className="border-b pb-6 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold shrink-0 overflow-hidden">
          {avatarUrl
            ? <img src={avatarUrl} alt={review.user_name} className="w-full h-full object-cover" />
            : (review.user_name?.[0]?.toUpperCase() || 'U')}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{review.user_name || 'Ẩn danh'}</span>
            {review.verified_purchase && (
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                ✓ Đã mua hàng
              </span>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              {new Date(review.created_at).toLocaleDateString('vi-VN')}
            </span>
          </div>

          <StarRating value={review.rating} readonly size="default" />

          {review.comment && (
            <p className="text-sm text-gray-700 mt-2 leading-relaxed">{review.comment}</p>
          )}

          {images.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxImg(img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${img}`)}
                  className="w-20 h-20 rounded-lg overflow-hidden border hover:opacity-80 transition-opacity"
                >
                  <img
                    src={img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${img}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => { if (!voted) { setHelpful(h => h + 1); setVoted(true); } }}
            className={`mt-3 flex items-center gap-1.5 text-xs transition-colors ${voted ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            Hữu ích ({helpful})
          </button>
        </div>
      </div>

      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button className="absolute top-4 right-4 text-white" onClick={() => setLightboxImg(null)}>
            <X className="w-8 h-8" />
          </button>
          <img src={lightboxImg} alt="" className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </div>
  );
}

export default function ReviewSection({ productId, onStatsUpdate }) {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState(0); // 0 = all

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    reviewsAPI.getByProduct(productId)
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [productId]);

  // Notify parent of review stats changes
  useEffect(() => {
    if (onStatsUpdate) {
      const avgRating = reviews.length
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
      onStatsUpdate({ avgRating, count: reviews.length });
    }
  }, [reviews, onStatsUpdate]);

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const starCounts = [5, 4, 3, 2, 1].map(s => ({
    star: s,
    count: reviews.filter(r => r.rating === s).length,
  }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const removePreview = (i) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) { toast.error('Vui lòng đăng nhập để đánh giá'); return; }
    if (rating === 0) { toast.error('Vui lòng chọn số sao'); return; }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('product_id', productId);
      formData.append('user_id', currentUser.id);
      formData.append('rating', rating);
      formData.append('comment', comment);
      images.forEach(img => formData.append('images', img));

      const newReview = await reviewsAPI.create(formData);
      setReviews(prev => [{ ...newReview, user_name: currentUser.name, avatar: currentUser.avatar }, ...prev]);
      setShowForm(false);
      setComment('');
      setRating(5);
      setImages([]);
      setPreviews([]);
      toast.success('Đã gửi đánh giá thành công!');
    } catch (err) {
      toast.error(err.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = filter === 0 ? reviews : reviews.filter(r => r.rating === filter);

  return (
    <div className="mt-16 border-t pt-12">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h2 className="text-2xl font-bold">Đánh giá sản phẩm</h2>

        {/* Write review button — always visible */}
        {!showForm && (
          currentUser ? (
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowForm(true);
              }}
              variant="default"
              className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
            >
              ✍️ Viết đánh giá của bạn
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="border-amber-600 text-amber-700 hover:bg-amber-50"
              onClick={() => toast.error('Vui lòng đăng nhập để viết đánh giá')}
            >
              🔒 Đăng nhập để viết đánh giá
            </Button>
          )
        )}
      </div>

      {/* Summary */}
      <div className="grid md:grid-cols-2 gap-8 mb-10 p-6 bg-muted/30 rounded-2xl">
        <div className="text-center">
          <div className="text-6xl font-bold text-primary mb-2">
            {avgRating.toFixed(1)}
          </div>
          <StarRating value={Math.round(avgRating)} readonly />
          <p className="text-sm text-muted-foreground mt-1">{reviews.length} đánh giá</p>
        </div>
        <div className="space-y-2">
          {starCounts.map(({ star, count }) => (
            <button
              key={star}
              onClick={() => setFilter(filter === star ? 0 : star)}
              className={`w-full flex items-center gap-3 text-sm group ${filter === star ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
            >
              <span className="w-8 text-right text-xs">{star}★</span>
              <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : '0%' }}
                />
              </div>
              <span className="w-6 text-xs text-muted-foreground">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Write review form shown below when toggled */}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-10 border rounded-2xl p-6 bg-muted/10 space-y-4">
          <h3 className="font-semibold">Đánh giá của bạn</h3>

          <div>
            <p className="text-sm mb-2">Xếp hạng *</p>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>

          <Textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
            rows={4}
          />

          {/* Image upload */}
          <div>
            <p className="text-sm mb-2">Thêm ảnh (tối đa 5 ảnh)</p>
            <div className="flex gap-2 flex-wrap">
              {previews.map((src, i) => (
                <div key={i} className="relative w-20 h-20">
                  <img src={src} alt="" className="w-full h-full object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => removePreview(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {previews.length < 5 && (
                <label className="w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors text-muted-foreground hover:text-primary">
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-xs mt-1">Thêm ảnh</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImages} />
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Hủy
            </Button>
          </div>
        </form>
      )}

      {/* Filter */}
      {filter > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Đang lọc: {filter} sao</span>
          <button onClick={() => setFilter(0)} className="text-xs text-primary hover:underline">Xóa lọc</button>
        </div>
      )}

      {/* Review list */}
      {loading ? (
        <p className="text-muted-foreground text-sm">Đang tải đánh giá...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Star className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p>Chưa có đánh giá nào{filter > 0 ? ` cho ${filter} sao` : ''}.</p>
          {!currentUser && <p className="text-sm mt-1">Đăng nhập để viết đánh giá đầu tiên!</p>}
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map(r => <ReviewItem key={r.id} review={r} />)}
        </div>
      )}
    </div>
  );
}
