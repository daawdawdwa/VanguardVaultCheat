'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Loader2,
  Pencil,
  Trash2,
  X,
  RefreshCw,
} from 'lucide-react';

import { supabase } from '@/lib/supabase';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

import { formatPrice } from '@/lib/helpers';
import { toast } from 'sonner';

import type { Product, Category } from '@/lib/types';

type ProductForm = {
  title: string;
  description: string;
  price: string;
  discount: string;
  stock: string;
  game_version: string;
  thumbnail_url: string;
  category_id: string;
  featured: boolean;
  popular: boolean;
};

const EMPTY_FORM: ProductForm = {
  title: '',
  description: '',
  price: '',
  discount: '0',
  stock: '0',
  game_version: 'v1.0',
  thumbnail_url: '',
  category_id: '',
  featured: false,
  popular: false,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ก-๙]+/gi, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);

  const load = async () => {
    try {
      setLoading(true);

      const [
        { data: prods, error: productsError },
        { data: cats, error: categoriesError },
      ] = await Promise.all([
        supabase
          .from('products')
          .select(
            `
              *,
              category:categories(*)
            `,
          )
          .order('created_at', { ascending: false }),

        supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true }),
      ]);

      if (productsError) {
        console.error('PRODUCT LOAD ERROR:', productsError);
        toast.error(`โหลดสินค้าไม่สำเร็จ: ${productsError.message}`);
        return;
      }

      if (categoriesError) {
        console.error('CATEGORY LOAD ERROR:', categoriesError);
        toast.error(`โหลดหมวดหมู่ไม่สำเร็จ: ${categoriesError.message}`);
        return;
      }

      setProducts((prods as unknown as Product[]) ?? []);
      setCategories((cats as unknown as Category[]) ?? []);
    } catch (error) {
      console.error('LOAD ERROR:', error);

      toast.error(
        error instanceof Error
          ? error.message
          : 'ไม่สามารถโหลดข้อมูลได้',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);

    setForm({
      title: product.title ?? '',
      description: product.description ?? '',
      price: String(product.price ?? ''),
      discount: String(product.discount ?? 0),
      stock: String(product.stock ?? 0),
      game_version: product.game_version ?? 'v1.0',
      thumbnail_url: product.thumbnail_url ?? '',
      category_id: product.category_id ?? '',
      featured: Boolean(product.featured),
      popular: Boolean(product.popular),
    });

    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditing(null);
    setForm({ ...EMPTY_FORM });
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving) return;

    try {
      setSaving(true);

      /*
       * 1. ตรวจ session ปัจจุบัน
       */
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('SESSION ERROR:', sessionError);
        toast.error(`ตรวจสอบ Session ไม่สำเร็จ: ${sessionError.message}`);
        return;
      }

      if (!session?.user) {
        toast.error('กรุณาเข้าสู่ระบบใหม่ก่อนแก้ไขสินค้า');
        return;
      }

      /*
       * 2. ตรวจ role จาก Supabase Auth
       */
      const role = session.user.app_metadata?.role;

      console.log('ADMIN PRODUCT SAVE:', {
        userId: session.user.id,
        email: session.user.email,
        role,
        editingId: editing?.id,
      });

      if (role !== 'admin' && role !== 'moderator') {
        toast.error('บัญชีนี้ไม่มีสิทธิ์จัดการสินค้า');
        return;
      }

      /*
       * 3. Validate
       */
      const title = form.title.trim();

      if (!title) {
        toast.error('กรุณากรอกชื่อสินค้า');
        return;
      }

      const price = Number.parseFloat(form.price);

      if (!Number.isFinite(price) || price < 0) {
        toast.error('กรุณาระบุราคาสินค้าให้ถูกต้อง');
        return;
      }

      const discount = Number.parseInt(form.discount, 10);

      if (
        !Number.isFinite(discount) ||
        discount < 0 ||
        discount > 100
      ) {
        toast.error('ส่วนลดต้องอยู่ระหว่าง 0 - 100%');
        return;
      }

      const stock = Number.parseInt(form.stock, 10);

      if (!Number.isFinite(stock) || stock < 0) {
        toast.error('จำนวนสินค้าไม่ถูกต้อง');
        return;
      }

      /*
       * 4. สร้าง payload
       *
       * สำคัญ:
       * ไม่ส่ง id เข้าไปใน UPDATE
       */
      const payload = {
        title,
        slug: slugify(title),
        description: form.description.trim() || null,
        price,
        discount,
        stock,
        game_version: form.game_version.trim() || 'v1.0',
        thumbnail_url: form.thumbnail_url.trim() || null,
        category_id: form.category_id || null,
        featured: form.featured,
        popular: form.popular,
      };

      /*
       * 5. UPDATE
       */
      if (editing) {
        console.log('UPDATING PRODUCT:', {
          id: editing.id,
          payload,
        });

        const {
          data: updatedProducts,
          error: updateError,
        } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editing.id)
          .select('*');

        console.log('UPDATE RESULT:', {
          updatedProducts,
          updateError,
        });

        if (updateError) {
          console.error('PRODUCT UPDATE ERROR:', updateError);

          toast.error(
            `อัปเดตสินค้าไม่สำเร็จ: ${updateError.message}`,
          );

          return;
        }

        /*
         * ถ้า RLS block UPDATE
         * Supabase จะคืน [] โดยไม่มี error
         */
        if (!updatedProducts || updatedProducts.length === 0) {
          toast.error(
            'ไม่สามารถอัปเดตสินค้าได้: ไม่พบข้อมูลหรือไม่มีสิทธิ์แก้ไข (RLS)',
          );

          console.error(
            'UPDATE RETURNED ZERO ROWS. Check products UPDATE RLS policy.',
          );

          return;
        }

        toast.success('อัปเดตสินค้าสำเร็จ');

        setShowForm(false);
        setEditing(null);
        setForm({ ...EMPTY_FORM });

        await load();

        return;
      }

      /*
       * 6. INSERT
       */
      console.log('CREATING PRODUCT:', payload);

      const {
        data: createdProducts,
        error: insertError,
      } = await supabase
        .from('products')
        .insert(payload)
        .select('*');

      console.log('INSERT RESULT:', {
        createdProducts,
        insertError,
      });

      if (insertError) {
        console.error('PRODUCT INSERT ERROR:', insertError);

        toast.error(
          `สร้างสินค้าไม่สำเร็จ: ${insertError.message}`,
        );

        return;
      }

      if (!createdProducts || createdProducts.length === 0) {
        toast.error(
          'สร้างสินค้าไม่สำเร็จ: ไม่มีข้อมูลถูกเพิ่ม',
        );

        return;
      }

      toast.success('สร้างสินค้าสำเร็จ');

      setShowForm(false);
      setEditing(null);
      setForm({ ...EMPTY_FORM });

      await load();
    } catch (error) {
      console.error('SAVE PRODUCT ERROR:', error);

      toast.error(
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาดในการบันทึกสินค้า',
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (deleting) return;

    const confirmed = window.confirm(
      'คุณต้องการลบสินค้านี้ใช่หรือไม่?\nการดำเนินการนี้ไม่สามารถย้อนกลับได้',
    );

    if (!confirmed) return;

    try {
      setDeleting(id);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        toast.error('กรุณาเข้าสู่ระบบใหม่');
        return;
      }

      const role = session.user.app_metadata?.role;

      if (role !== 'admin' && role !== 'moderator') {
        toast.error('บัญชีนี้ไม่มีสิทธิ์ลบสินค้า');
        return;
      }

      const {
        data: deletedProducts,
        error: deleteError,
      } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .select('*');

      console.log('DELETE RESULT:', {
        deletedProducts,
        deleteError,
      });

      if (deleteError) {
        console.error('PRODUCT DELETE ERROR:', deleteError);

        toast.error(
          `ลบสินค้าไม่สำเร็จ: ${deleteError.message}`,
        );

        return;
      }

      if (!deletedProducts || deletedProducts.length === 0) {
        toast.error(
          'ลบสินค้าไม่สำเร็จ: ไม่พบข้อมูลหรือไม่มีสิทธิ์ลบ',
        );

        return;
      }

      toast.success('ลบสินค้าสำเร็จ');

      await load();
    } catch (error) {
      console.error('DELETE ERROR:', error);

      toast.error(
        error instanceof Error
          ? error.message
          : 'ไม่สามารถลบสินค้าได้',
      );
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">
            จัดการสินค้า ({products.length})
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            เพิ่ม แก้ไข และจัดการสินค้าในร้านค้า
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                loading ? 'animate-spin' : ''
              }`}
            />
            รีเฟรช
          </Button>

          <Button
            type="button"
            onClick={openCreate}
            className="gradient-primary text-white hover:opacity-90"
          >
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มสินค้า
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center rounded-xl border border-border bg-card">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          ยังไม่มีสินค้าในระบบ
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center"
            >
              <div className="h-20 w-full flex-shrink-0 overflow-hidden rounded-lg bg-secondary sm:h-12 sm:w-16">
                {product.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.thumbnail_url}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                    ไม่มีรูป
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {product.title}
                </p>

                <p className="text-xs text-muted-foreground">
                  {product.category?.name ?? 'ไม่มีหมวดหมู่'}
                  {' • '}
                  {product.game_version ?? 'v1.0'}
                  {' • '}
                  คลัง: {product.stock}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {product.featured && (
                  <Badge className="gradient-primary text-white">
                    แนะนำ
                  </Badge>
                )}

                {product.popular && (
                  <Badge variant="secondary">
                    ยอดนิยม
                  </Badge>
                )}

                <span className="text-sm font-semibold">
                  {formatPrice(product.price)}
                </span>

                <button
                  type="button"
                  onClick={() => openEdit(product)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label={`แก้ไข ${product.title}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => void remove(product.id)}
                  disabled={deleting === product.id}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`ลบ ${product.title}`}
                >
                  {deleting === product.id ? (
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
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">
                  {editing
                    ? 'แก้ไขสินค้า'
                    : 'สร้างสินค้าใหม่'}
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  {editing
                    ? `ID: ${editing.id}`
                    : 'กรอกข้อมูลสินค้าที่ต้องการเพิ่ม'}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="ปิด"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={save}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="title">
                  ชื่อสินค้า
                </Label>

                <Input
                  id="title"
                  required
                  value={form.title}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      title: event.target.value,
                    })
                  }
                  className="bg-card"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  รายละเอียด
                </Label>

                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                  className="bg-card"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    ราคา (฿)
                  </Label>

                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        price: event.target.value,
                      })
                    }
                    className="bg-card"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount">
                    ส่วนลด (%)
                  </Label>

                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={form.discount}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        discount: event.target.value,
                      })
                    }
                    className="bg-card"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stock">
                    จำนวนคลังสินค้า
                  </Label>

                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        stock: event.target.value,
                      })
                    }
                    className="bg-card"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="version">
                    เวอร์ชันเกม
                  </Label>

                  <Input
                    id="version"
                    value={form.game_version}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        game_version: event.target.value,
                      })
                    }
                    className="bg-card"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">
                  URL รูปภาพหน้าปก
                </Label>

                <Input
                  id="thumbnail"
                  type="url"
                  value={form.thumbnail_url}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      thumbnail_url: event.target.value,
                    })
                  }
                  placeholder="https://..."
                  className="bg-card"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  หมวดหมู่
                </Label>

                <select
                  id="category"
                  value={form.category_id}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      category_id: event.target.value,
                    })
                  }
                  className="flex h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">
                    ไม่มีหมวดหมู่
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 rounded-xl border border-border bg-card/50 p-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        featured: event.target.checked,
                      })
                    }
                    className="accent-primary"
                  />

                  <span>
                    สินค้าแนะนำ (Featured)
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.popular}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        popular: event.target.checked,
                      })
                    }
                    className="accent-primary"
                  />

                  <span>
                    สินค้ายอดนิยม (Popular)
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="w-full gradient-primary text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : editing ? (
                  'บันทึกการเปลี่ยนแปลง'
                ) : (
                  'สร้างสินค้า'
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
