import { useEffect, useState } from 'react'
import { settingsAPI } from '../lib/api'
import { useToast } from '../components/ui/Toast'
import PageHeader from '../components/ui/PageHeader'
import Spinner from '../components/ui/Spinner'
import {
  Store, Phone, Globe2, CreditCard, Save, MessageSquare, Facebook, Instagram,
  Youtube, Truck, Wrench, ShieldAlert, Sparkles
} from 'lucide-react'

const TABS = [
  { id: 'general',  label: 'Thông tin chung',     icon: Store },
  { id: 'contact',  label: 'Liên hệ',             icon: Phone },
  { id: 'social',   label: 'Mạng xã hội',         icon: Globe2 },
  { id: 'payment',  label: 'Thanh toán & vận chuyển', icon: CreditCard },
  { id: 'system',   label: 'Hệ thống',            icon: Wrench },
]

export default function SettingsPage() {
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const toast = useToast()

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const data = await settingsAPI.getAll()
      setForm(data)
    } catch (e) {
      toast.error('Không thể tải cấu hình: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await settingsAPI.update(form)
      toast.success('Đã lưu cấu hình')
    } catch (e) {
      toast.error('Lưu thất bại: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !form) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cấu hình cửa hàng"
        description="Thông tin liên hệ, thanh toán và các tuỳ chỉnh chung"
        actions={
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            <Save className="w-4 h-4" /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar tabs */}
        <div className="card p-2 h-fit lg:sticky lg:top-20">
          <nav className="space-y-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-brand-50 text-brand-800'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-4">
          {activeTab === 'general' && (
            <Card title="Thông tin chung" icon={Store}>
              <Field label="Tên cửa hàng">
                <input className="input" value={form.site_name || ''} onChange={(e) => set('site_name', e.target.value)} />
              </Field>
              <Field label="Khẩu hiệu">
                <input className="input" value={form.site_tagline || ''} onChange={(e) => set('site_tagline', e.target.value)} />
              </Field>
              <Field label="Ghi chú vận chuyển / chính sách">
                <textarea
                  rows={3}
                  className="input min-h-[90px]"
                  value={form.shipping_note || ''}
                  onChange={(e) => set('shipping_note', e.target.value)}
                />
              </Field>
            </Card>
          )}

          {activeTab === 'contact' && (
            <Card title="Thông tin liên hệ" icon={Phone}>
              <Field label="Email hỗ trợ">
                <input className="input" value={form.contact_email || ''} onChange={(e) => set('contact_email', e.target.value)} />
              </Field>
              <Field label="Số điện thoại">
                <input className="input" value={form.contact_phone || ''} onChange={(e) => set('contact_phone', e.target.value)} />
              </Field>
              <Field label="Địa chỉ">
                <textarea
                  rows={2}
                  className="input min-h-[80px]"
                  value={form.contact_address || ''}
                  onChange={(e) => set('contact_address', e.target.value)}
                />
              </Field>
            </Card>
          )}

          {activeTab === 'social' && (
            <Card title="Mạng xã hội" icon={Globe2}>
              <SocialField icon={Facebook}   label="Facebook"  value={form.social_facebook || ''} onChange={(v) => set('social_facebook', v)} placeholder="https://facebook.com/luxe.vn" />
              <SocialField icon={Instagram}  label="Instagram" value={form.social_instagram || ''} onChange={(v) => set('social_instagram', v)} placeholder="https://instagram.com/luxe.vn" />
              <SocialField icon={() => <span className="font-bold text-xs">T</span>} label="TikTok" value={form.social_tiktok || ''} onChange={(v) => set('social_tiktok', v)} placeholder="https://tiktok.com/@luxe" />
              <SocialField icon={Youtube}    label="YouTube"   value={form.social_youtube || ''} onChange={(v) => set('social_youtube', v)} placeholder="https://youtube.com/@luxe" />
              <SocialField icon={MessageSquare} label="Zalo"    value={form.social_zalo || ''} onChange={(v) => set('social_zalo', v)} placeholder="https://zalo.me/..." />
            </Card>
          )}

          {activeTab === 'payment' && (
            <Card title="Thanh toán & Vận chuyển" icon={CreditCard}>
              <Toggle
                icon={Truck}
                label="Cho phép thanh toán khi nhận hàng (COD)"
                checked={!!form.cod_enabled}
                onChange={(v) => set('cod_enabled', v)}
              />
              <Toggle
                icon={CreditCard}
                label="Bật VNPay"
                checked={!!form.vnpay_enabled}
                onChange={(v) => set('vnpay_enabled', v)}
              />
              <Toggle
                icon={Sparkles}
                label="Bật VietQR (chuyển khoản)"
                checked={!!form.vietqr_enabled}
                onChange={(v) => set('vietqr_enabled', v)}
              />
            </Card>
          )}

          {activeTab === 'system' && (
            <Card title="Hệ thống" icon={Wrench}>
              <Toggle
                icon={ShieldAlert}
                label="Bảo trì hệ thống (tạm tắt cửa hàng)"
                checked={!!form.maintenance_mode}
                onChange={(v) => set('maintenance_mode', v)}
                warn={!!form.maintenance_mode}
              />
              {form.maintenance_mode && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg p-3 mt-2">
                  ⚠️ Khi bật chế độ bảo trì, cửa hàng sẽ không thể truy cập ngoại trừ trang quản trị.
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function Card({ title, icon: Icon, children }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        {Icon && <Icon className="w-5 h-5 text-brand-700" />}
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

function Toggle({ icon: Icon, label, checked, onChange, warn }) {
  return (
    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
      checked
        ? warn ? 'bg-amber-50 border-amber-200' : 'bg-brand-50 border-brand-200'
        : 'bg-slate-50 border-slate-200'
    }`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
        checked ? 'bg-brand-100 text-brand-700' : 'bg-slate-200 text-slate-500'
      }`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="flex-1 text-sm font-medium text-slate-800">{label}</span>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); onChange(!checked) }}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-brand-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </label>
  )
}

function SocialField({ icon: Icon, label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="label flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </label>
      <input
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}