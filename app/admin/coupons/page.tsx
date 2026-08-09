'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  Loader2,
  X,
  RefreshCw,
} from 'lucide-react';

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
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState<CouponForm>({
    code: '',
    type: 'percent',
    value: '10',
    usage_limit: '100',
  });

  const load = async () => {
    try {
      setLoading(true);

      const {
        data,
        error,
      } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('COUPONS LOAD ERROR:', error);

        toast.error(
          `โหลดคูปองไม่สำเร็จ: ${error.message}`,
        );

        return;
      }

      setCoupons((data as Coupon[]) ?? []);
    } catch (error) {
      console.error('COUPONS LOAD ERROR:', error);

      toast.error(
        error instanceof Error
          ? error.message
          : 'ไม่สามารถโหลดคูปองได้',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setForm({
      code: '',
      type: 'percent',
      value: '10',
      usage_limit: '100',
    });

    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
  };

  const create = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (saving) return;

    const code = form.code.trim().toUpperCase();
    const value = Number.parseFloat(form.value);

    if (!code) {
      toast.error('กรุณากรอกรหัสคูปอง');
      return;
    }

    if (!Number.isFinite(value) || value <= 0) {
      toast.error('จำนวนส่วนลดไม่ถูกต้อง');
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
      (!Number.isFinite(usageLimit) || usageLimit < 1)
    ) {
      toast.error('จำนวนครั้งที่ใช้งานต้องเป็นจำนวนเต็มมากกว่า 0');
      return;
    }

    try {
      setSaving(true);

      const {
        data: {
          session,
        },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        toast.error('กรุณาเข้าสู่ระบบใหม่');
        return;
      }

      const role = session.user.app_metadata?.role;

      if (role !== 'admin' && role !== 'moderator') {
        toast.error('บัญชีนี้ไม่มีสิทธิ์จัดการคูปอง');
        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from('coupons')
        .insert({
          code,
          type: form.type,
          value,
          usage_limit: usageLimit,
          active: true,
        })
        .select('*');

      if (error) {
        console.error('COUPON CREATE ERROR:', error);

        toast.error(
          `สร้างคูปองไม่สำเร็จ: ${error.message}`,
        );

        return;
      }

      if (!data || data.length === 0) {
        toast.error('สร้างคูปองไม่สำเร็จ: ไม่พบข้อมูลที่ถูกสร้าง');
        return;
      }

      toast.success('สร้างคูปองสำเร็จ');

      setShowForm(false);

      setForm({
        code: '',
        type: 'percent',
        value: '10',
        usage_limit: '100',
      });

      await load();
    } catch (error) {
      console.error('COUPON CREATE ERROR:', error);

      toast.error(
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาดในการสร้างคูปอง',
      );
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (coupon: Coupon) => {
    if (toggling) return;

    try {
      setToggling(coupon.id);

      const {
        data: {
          session,
        },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        toast.error('กรุณาเข้าสู่ระบบใหม่');
        return;
      }

      const role = session.user.app_metadata?.role;

      if (role !== 'admin' && role !== 'moderator') {
        toast.error('บัญชีนี้ไม่มีสิทธิ์จัดการคูปอง');
        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from('coupons')
        .update({
          active: !coupon.active,
        })
        .eq('id', coupon.id)
        .select('*');

      if (error) {
        console.error('COUPON TOGGLE ERROR:', error);

        toast.error(
          `เปลี่ยนสถานะคูปองไม่สำเร็จ: ${error.message}`,
        );

        return;
      }

      if (!data || data.length === 0) {
        toast.error(
          'เปลี่ยนสถานะคูปองไม่สำเร็จ: ไม่มีสิทธิ์หรือไม่พบข้อมูล',
        );

        return;
      }

      toast.success(
        coupon.active
          ? 'ปิดใช้งานคูปองแล้ว'
          : 'เปิดใช้งานคูปองแล้ว',
      );

      await load();
    } catch (error) {
      console.error('COUPON TOGGLE ERROR:', error);

      toast.error(
        error instanceof Error
          ? error.message
          : 'ไม่สามารถเปลี่ยนสถานะคูปองได้',
      );
    } finally {
      setToggling(null);
    }
  };

  const remove = async (id: string) => {
    if (deleting) return;

    const confirmed = window.confirm(
      'คุณต้องการลบคูปองนี้ใช่หรือไม่?\nการดำเนินการนี้ไม่สามารถย้อนกลับได้',
    );

    if (!confirmed) return;

    try {
      setDeleting(id);

      const {
        data: {
          session,
        },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        toast.error('กรุณาเข้าสู่ระบบใหม่');
        return;
      }

      const role = session.user.app_metadata?.role;

      if (role !== 'admin' && role !== 'moderator') {
        toast.error('บัญชีนี้ไม่มีสิทธิ์ลบคูปอง');
        return;
      }

      const {
        data: deletedRows,
        error,
      } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id)
        .select('*');

      console.log('COUPON DELETE RESULT:', {
        deletedRows,
        error,
      });

      if (error) {
        console.error('COUPON DELETE ERROR:', error);

        toast.error(
          `ลบคูปองไม่สำเร็จ: ${error.message}`,
        );

        return;
      }

      if (!deletedRows || deletedRows.length === 0) {
        toast.error(
          'ลบคูปองไม่สำเร็จ: ไม่พบข้อมูลหรือไม่มีสิทธิ์ลบ',
        );

        return;
      }

      toast.success('ลบคูปองสำเร็จ');

      await load();
    } catch (error) {
      console.error('COUPON DELETE ERROR:', error);

      toast.error(
        error instanceof Error
          ? error.message
          : 'ไม่สามารถลบคูปองได้',
      );
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">
            คูปองส่วนลด ({coupons.length})
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            สร้าง เปิด/ปิด และลบคูปองส่วนลด
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void load()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            รีเฟรช
          </Button>

          <Button
            type="button"
            onClick={openCreate}
            className="gradient-primary text-white hover:opacity-90"
          >
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มคูปอง
          </Button>
        </div>
      </div>

      {coupons.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          ยังไม่มีคูปองส่วนลดในขณะนี้
        </div>
      ) : (
        <div className="space-y-2">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center"
            >
              <code className="w-fit rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-mono">
                {coupon.code}
              </code>

              <div className="flex-1 text-sm text-muted-foreground">
                {coupon.type === 'percent'
                  ? `ลด ${coupon.value}%`
                  : `ลด ${formatPrice(coupon.value)}`}

                {' • '}

                ใช้งานแล้ว {coupon.used_count}/
                {coupon.usage_limit ?? '∞'}
              </div>

              <Badge
                variant={
                  coupon.active
                    ? 'default'
                    : 'secondary'
                }
              >
                {coupon.active
                  ? 'เปิดใช้งาน'
                  : 'ปิดใช้งาน'}
              </Badge>

              <button
                type="button"
                onClick={() => void toggle(coupon)}
                disabled={toggling === coupon.id}
                className="text-xs text-primary hover:underline disabled:opacity-50"
              >
                {toggling === coupon.id
                  ? 'กำลังบันทึก...'
                  : coupon.active
                    ? 'ปิดใช้งาน'
                    : 'เปิดใช้งาน'}
              </button>

              <button
                type="button"
                onClick={() => void remove(coupon.id)}
                disabled={deleting === coupon.id}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={`ลบคูปอง ${coupon.code}`}
              >
                {deleting === coupon.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass-strong w-full max-w-md rounded-2xl border border-border p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">
                  สร้างคูปองใหม่
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  กำหนดส่วนลดและจำนวนครั้งที่ใช้งาน
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="ปิด"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={create}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="code">
                  รหัสคูปอง
                </Label>

                <Input
                  id="code"
                  required
                  value={form.code}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      code: event.target.value.toUpperCase(),
                    })
                  }
                  placeholder="SUMMER20"
                  className="bg-card uppercase"
                  disabled={saving}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coupon-type">
                    ประเภทส่วนลด
                  </Label>

                  <select
                    id="coupon-type"
                    value={form.type}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        type: event.target.value as
                          | 'percent'
                          | 'fixed',
                      })
                    }
                    disabled={saving}
                    className="flex h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
                  >
                    <option value="percent">
                      เปอร์เซ็นต์ (%)
                    </option>

                    <option value="fixed">
                      จำนวนเงิน (฿)
                    </option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coupon-value">
                    จำนวนส่วนลด
                  </Label>

                  <Input
                    id="coupon-value"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.value}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        value: event.target.value,
                      })
                    }
                    className="bg-card"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="usage-limit">
                  จำนวนครั้งที่ใช้ได้
                </Label>

                <Input
                  id="usage-limit"
                  type="number"
                  min="1"
                  value={form.usage_limit}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      usage_limit: event.target.value,
                    })
                  }
                  placeholder="เว้นว่าง = ไม่จำกัด"
                  className="bg-card"
                  disabled={saving}
                />
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="w-full gradient-primary text-white hover:opacity-90"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังสร้าง...
                  </>
                ) : (
                  'สร้างคูปอง'
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
