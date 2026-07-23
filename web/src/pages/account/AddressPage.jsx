import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { MapPin, Plus, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addressesAPI } from '@/lib/api.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { CITIES, getDistricts } from '@/lib/vietnamLocations.js';

export default function AddressPage() {
  const { currentUser } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    is_default: false,
  });
  const [availableDistricts, setAvailableDistricts] = useState([]);

  // Update districts when city changes
  useEffect(() => {
    if (form.city) {
      const districts = getDistricts(form.city);
      setAvailableDistricts(districts);
      // Reset district if it's not in the new city's districts
      if (form.district && !districts.includes(form.district)) {
        setForm((prev) => ({ ...prev, district: '' }));
      }
    } else {
      setAvailableDistricts([]);
    }
  }, [form.city, form.district]);

  // Tải danh sách địa chỉ của user hiện tại
  useEffect(() => {
    if (!currentUser?.id) return;
    const fetchAddresses = async () => {
      setLoading(true);
      try {
        const data = await addressesAPI.list(currentUser.id);
        setAddresses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Fetch addresses error:', err);
        toast.error('Không thể tải danh sách địa chỉ');
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, [currentUser]);

  const resetForm = () => {
    setForm({ name: '', phone: '', address: '', city: '', district: '', is_default: false });
    setEditingId(null);
  };

  const handleEdit = (addr) => {
    setForm({
      name: addr.name,
      phone: addr.phone,
      address: addr.address,
      city: addr.city || '',
      district: addr.district || '',
      is_default: addr.is_default || false,
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser?.id) {
      toast.error('Vui lòng đăng nhập để lưu địa chỉ');
      return;
    }
    
    try {
      setSaving(true);
      
      if (editingId) {
        // Update existing address
        const updated = await addressesAPI.update(currentUser.id, editingId, form);
        setAddresses((prev) => prev.map((a) => (a.id === editingId ? updated : a)));
        toast.success('Đã cập nhật địa chỉ');
      } else {
        // Create new address
        const created = await addressesAPI.create(currentUser.id, form);
        setAddresses((prev) => [created, ...prev]);
        toast.success('Đã thêm địa chỉ');
      }
      
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error('Save address error:', err);
      toast.error(err?.message || 'Không thể lưu địa chỉ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!currentUser?.id) return;
    try {
      setDeletingId(id);
      await addressesAPI.remove(currentUser.id, id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success('Đã xóa địa chỉ');
    } catch (err) {
      console.error('Delete address error:', err);
      toast.error(err?.message || 'Không thể xóa địa chỉ');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id) => {
    if (!currentUser?.id) return;
    try {
      const updated = await addressesAPI.setDefault(currentUser.id, id);
      setAddresses((prev) => {
        const next = prev.map((a) => ({ ...a, is_default: a.id === id }));
        // Đảm bảo item vừa được set là is_default = true
        const found = next.find((a) => a.id === id);
        if (found) found.is_default = true;
        return next;
      });
      toast.success('Đã đặt làm địa chỉ mặc định');
    } catch (err) {
      console.error('Set default address error:', err);
      toast.error(err?.message || 'Không thể đặt địa chỉ mặc định');
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-center uppercase tracking-widest mb-8">
        Sổ địa chỉ
      </h1>

      <div className="max-w-lg space-y-4">
        {loading && addresses.length === 0 ? (
          <p className="text-gray-400 text-sm italic">Đang tải...</p>
        ) : addresses.length === 0 && !showForm ? (
          <p className="text-gray-400 text-sm italic">Chưa có địa chỉ nào được lưu</p>
        ) : null}

        {addresses.map((addr) => (
          <div key={addr.id} className="border rounded-lg p-4 flex justify-between items-start gap-3">
            <div className="flex gap-3 flex-1">
              <MapPin className="w-4 h-4 mt-0.5 text-amber-500 shrink-0" />
              <div className="text-sm flex-1">
                <p className="font-semibold flex items-center gap-2">
                  {addr.name} — {addr.phone}
                  {addr.is_default && (
                    <span className="text-[10px] uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                      Mặc định
                    </span>
                  )}
                </p>
                <p className="text-gray-500">
                  {addr.address}
                  {addr.district ? `, ${addr.district}` : ''}
                  {addr.city ? `, ${addr.city}` : ''}
                </p>
                {!addr.is_default && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs text-amber-600 hover:underline mt-1"
                  >
                    Đặt làm mặc định
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleEdit(addr)}
                className="text-gray-400 hover:text-blue-500 disabled:opacity-50"
                title="Chỉnh sửa"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(addr.id)}
                disabled={deletingId === addr.id}
                className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                title="Xóa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {showForm && (
          <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-sm">
              {editingId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Họ tên</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Số điện thoại</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Địa chỉ</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tỉnh / Thành phố *</Label>
                <select
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                  className="mt-1 w-full h-10 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">-- Chọn tỉnh/thành --</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Quận / Huyện *</Label>
                <select
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  required
                  disabled={!form.city}
                  className="mt-1 w-full h-10 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">-- Chọn quận/huyện --</option>
                  {availableDistricts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                className="rounded"
              />
              Đặt làm địa chỉ mặc định
            </label>
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={saving}
                className="bg-black text-white px-4 py-2 text-sm font-semibold uppercase hover:bg-gray-800"
              >
                {saving ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Lưu')}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-4 py-2 text-sm border hover:bg-gray-50"
              >
                Hủy
              </button>
            </div>
          </form>
        )}

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 text-sm font-semibold border px-4 py-2 hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" /> Thêm địa chỉ mới
          </button>
        )}
      </div>
    </>
  );
}