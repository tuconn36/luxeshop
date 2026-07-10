import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { measurementsAPI } from '@/lib/api.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

const fields = [
  { id: 'height', label: 'Chiều cao (cm)' },
  { id: 'weight', label: 'Cân nặng (kg)' },
  { id: 'chest', label: 'Ngực (cm)' },
  { id: 'waist', label: 'Eo (cm)' },
  { id: 'hip', label: 'Hông (cm)' },
  { id: 'shoulder', label: 'Vai (cm)' },
];

const emptyData = () => ({
  height: '',
  weight: '',
  chest: '',
  waist: '',
  hip: '',
  shoulder: '',
});

// Chuyển đổi giá trị input -> number hoặc null
const toNumberOrNull = (v) => {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export default function MeasurementsPage() {
  const { currentUser } = useAuth();
  const [data, setData] = useState(emptyData());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }
    const fetchMeasurements = async () => {
      setLoading(true);
      try {
        const result = await measurementsAPI.get(currentUser.id);
        const merged = { ...emptyData() };
        if (result && typeof result === 'object') {
          for (const f of fields) {
            const v = result[f.id];
            if (v !== null && v !== undefined) merged[f.id] = String(v);
          }
        }
        setData(merged);
      } catch (err) {
        console.error('Fetch measurements error:', err);
        toast.error('Không thể tải số đo');
      } finally {
        setLoading(false);
      }
    };
    fetchMeasurements();
  }, [currentUser]);

  const handleChange = (id, value) => {
    setData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser?.id) {
      toast.error('Vui lòng đăng nhập để lưu số đo');
      return;
    }
    try {
      setSaving(true);
      const payload = {};
      for (const f of fields) {
        payload[f.id] = toNumberOrNull(data[f.id]);
      }
      await measurementsAPI.save(currentUser.id, payload);
      toast.success('Đã lưu số đo');
    } catch (err) {
      console.error('Save measurements error:', err);
      toast.error(err?.message || 'Không thể lưu số đo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-center uppercase tracking-widest mb-8">
        Số đo của tôi
      </h1>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <p className="text-sm text-gray-500 mb-2">
          Lưu số đo để chúng tôi gợi ý size phù hợp cho bạn
        </p>
        {loading ? (
          <p className="text-sm text-gray-400">Đang tải...</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {fields.map(({ id, label }) => (
              <div key={id}>
                <Label htmlFor={id}>{label}</Label>
                <Input
                  id={id}
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  min="0"
                  value={data[id]}
                  onChange={(e) => handleChange(id, e.target.value)}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
            ))}
          </div>
        )}
        <Button
          type="submit"
          disabled={saving || loading}
          className="w-32 bg-black text-white py-2 font-semibold uppercase tracking-widest hover:bg-gray-800"
        >
          {saving ? 'Đang lưu...' : 'LƯU'}
        </Button>
      </form>
    </>
  );
}