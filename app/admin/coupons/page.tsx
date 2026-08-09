'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { Coupon } from '@/lib/types';
import { formatPrice } from '@/lib/helpers';

type CouponForm = {
  code: string;
  type: 'percent' | 'fixed';
  value: string;
  usage_limit: string;
  expires_at: string;
};

const emptyForm: CouponForm = {
  code: '',
  type: 'percent',
  value: '10',
  usage_limit: '100',
  expires_at: '',
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('coupons')
      .select(
        'id, code, type, value, active, expires_at, usage_limit, used_count, created_at',
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[AdminCoupons] load error:', error);
      toast.error(`โหลดคูปองไม่สำเร็จ: ${error.message}`);
      setCoupons([]);
      setLoading(false);
      return;
    }

    setCoupons((data as Coupon[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditing(coupon);

    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      usage_limit:
        coupon.usage_limit === null ? '' : String(coupon.usage_limit),
      expires_at: coupon.expires_at
        ? new Date(coupon.expires_at).toISOString().slice(0, 16)
        : '',
    });

    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const code = form.code.trim().toUpperCase();
    const value = Number(form.value);

    if (!code) {
      toast.error('กรุณาระบุรหัสคูปอง');
      return;
    }

    if (!Number.isFinite(value) || value <= 0) {
      toast.error('มูลค่าส่วนลดต้องมากกว่า 0');
      return;
    }

    if (form.type === 'percent' && value > 100) {
      toast.error('ส่วนลดเปอร์เซ็นต์ต้องไม่เกิน 100%');
      return;
    }

    const usageLimit =
      form.usage_limit.trim() === ''
        ? null
        : Number.parseInt(form.usage_limit, 10);

    if (
      usageLimit !== null &&
      (!Number.isInteger(usageLimit) || usageLimit < 1)
    ) {
      toast.error('จำนวนการใช้งานต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป');
      return;
    }

    const expiresAt = form.expires_at
      ? new Date(form.expires_at).toISOString()
      : null;

    setSaving(true);

    try {
      if (editing) {
        const { data, error } = await supabase
          .from('coupons')
          .update({
            code,
            type: form.type,
            value,
            usage_limit: usageLimit,
            expires_at: expiresAt,
          })
          .eq('id', editing.id)
          .select(
            'id, code, type, value, active, expires_at, usage_limit, used_count, created_at',
          )
          .single();

        if (error) {
          console.error('[AdminCoupons] update error:', error);
          toast.error(`อัปเดตคูปองไม่สำเร็จ: ${error.message}`);
          return;
        }

        if (!data) {
          toast.error('ไม่พบคูปองหรือไม่มีสิทธิ์แก้ไข');
          return;
        }

        toast.success('อัปเดตคูปองสำเร็จ');
      } else {
        const { data, error } = await supabase
          .from('coupons')
          .insert({
            code,
            type: form.type,
            value,
            usage_limit: usageLimit,
            expires_at: expiresAt,
            active: true,
          })
          .select(
            'id, code, type, value, active, expires_at, usage_limit, used_count, created_at',
          )
          .single();

        if (error) {
          console.error('[AdminCoupons] insert error:', error);
          toast.error(`สร้างคูปองไม่สำเร็จ: ${error.message}`);
          return;
        }

        if (!data) {
          toast.error('ไม่สามารถสร้างคูปองได้');
          return;
        }

        toast.success('สร้างคูปองสำเร็จ');
      }

      closeForm();
      await load();
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (coupon: Coupon) => {
    if (togglingId) return;

    setTogglingId(coupon.id);

    try {
      const { data, error } = await supabase
        .from('coupons')
        .update({
          active: !coupon.active,
        })
        .eq('id', coupon.id)
        .select('id, active')
        .single();

      if (error) {
        console.error('[AdminCoupons] toggle error:', error);
        toast.error(`เปลี่ยนสถานะคูปองไม่สำเร็จ: ${error.message}`);
        return;
      }

      if (!data) {
        toast.error('ไม่พบคูปองหรือไม่มีสิทธิ์แก้ไข');
        return;
      }

      setCoupons((current) =>
        current.map((item) =>
          item.id === coupon.id
            ? {
                ...item,
                active: data.active,
              }
            : item,
        ),
      );

      toast.success(
        data.active
          ? 'เปิดใช้งานคูปองสำเร็จ'
          : 'ปิดใช้งานคูปองสำเร็จ',
      );
    } finally {
      setTogglingId(null);
    }
  };

  const remove = async (id: string) => {
    if (deletingId) return;

    const confirmed = window.confirm(
      'คุณต้องการลบคูปองนี้ใช่หรือไม่?\n\nการลบจะไม่สามารถย้อนกลับได้',
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      const { data, error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id)
        .select('id')
        .single();

      if (error) {
        console.error('[AdminCoupons] delete error:', error);
        toast.error(`ลบคูปองไม่สำเร็จ: ${error.message}`);
        return;
      }

      if (!data) {
        toast.error('ไม่พบคูปองหรือไม่มีสิทธิ์ลบ');
        return;
      }

      setCoupons((current) => current.filter((coupon) => coupon.id !== id));

      toast.success('ลบคูปองสำเร็จ');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">
            คูปองส่วนลด ({coupons.length})
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            สร้าง แก้ไข เปิด/ปิด และลบคูปองส่วนลด
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreate}
          className="gradient-primary text-white hover:opacity-90"
        >
          <Plus className="mr-2 h-4 w-4" />
          เพิ่มคูปอง
        </Button>
      </div>

      {coupons.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            ยังไม่มีคูปองส่วนลดในระบบ
          </p>

          <Button
            type="button"
            onClick={openCreate}
            variant="outline"
            className="mt-4"
          >
            <Plus className="mr-2 h-4 w-4" />
            สร้างคูปองแรก
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-card/80 sm:flex-row sm:items-center"
            >
              <code className="w-fit rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-mono font-semibold">
                {coupon.code}
              </code>

              <div className="min-w-0 flex-1 text-sm text-muted-foreground">
                <span>
                  {coupon.type === 'percent'
                    ? `ลด ${coupon.value}%`
                    : `ลด ${formatPrice(coupon.value)}`}
                </span>

                <span className="mx-2">•</span>

                <span>
                  ใช้งานแล้ว {coupon.used_count}/
                  {coupon.usage_limit ?? '∞'}
                </span>

                {coupon.expires_at && (
                  <>
                    <span className="mx-2">•</span>
                    <span>
                      หมดอายุ{' '}
                      {new Date(coupon.expires_at).toLocaleString('th-TH')}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={coupon.active ? 'default' : 'secondary'}
                >
                  {coupon.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </Badge>

                <button
                  type="button"
                  onClick={() => void toggle(coupon)}
                  disabled={togglingId === coupon.id}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
                >
                  {togglingId === coupon.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : coupon.active ? (
                    'ปิดใช้งาน'
                  ) : (
                    'เปิดใช้งาน'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => openEdit(coupon)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label={`แก้ไข ${coupon.code}`}
                  title="แก้ไขคูปอง"
                >
                  <Pencil className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => void remove(coupon.id)}
                  disabled={deletingId === coupon.id}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  aria-label={`ลบ ${coupon.code}`}
                  title="ลบคูปอง"
                >
                  {deletingId === coupon.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass-strong max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">
                  {editing ? 'แก้ไขคูปอง' : 'สร้างคูปองใหม่'}
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  ข้อมูลจะถูกบันทึกลง Supabase โดยตรง
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
                aria-label="ปิด"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={save} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="coupon-code">รหัสคูปอง</Label>

                <Input
                  id="coupon-code"
                  required
                  maxLength={100}
                  value={form.code}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      code: event.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="SUMMER20"
                  className="bg-card font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="coupon-type">ประเภทส่วนลด</Label>

                  <select
                    id="coupon-type"
                    value={form.type}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        type: event.target.value as 'percent' | 'fixed',
                      }))
                    }
                    className="flex h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="percent">เปอร์เซ็นต์ (%)</option>
                    <option value="fixed">จำนวนเงินคงที่ (฿)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coupon-value">มูลค่าส่วนลด</Label>

                  <Input
                    id="coupon-value"
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={form.value}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        value: event.target.value,
                      }))
                    }
                    className="bg-card"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coupon-limit">
                  จำกัดจำนวนการใช้งาน
                </Label>

                <Input
                  id="coupon-limit"
                  type="number"
                  min="1"
                  value={form.usage_limit}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      usage_limit: event.target.value,
                    }))
                  }
                  placeholder="เว้นว่าง = ไม่จำกัด"
                  className="bg-card"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coupon-expires">
                  วันหมดอายุ
                </Label>

                <Input
                  id="coupon-expires"
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      expires_at: event.target.value,
                    }))
                  }
                  className="bg-card"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeForm}
                  disabled={saving}
                  className="flex-1"
                >
                  ยกเลิก
                </Button>

                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 gradient-primary text-white hover:opacity-90"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : editing ? (
                    'บันทึกการเปลี่ยนแปลง'
                  ) : (
                    'สร้างคูปอง'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
