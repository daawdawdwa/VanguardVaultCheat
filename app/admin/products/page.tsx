'use client';

import { useCallback, useEffect, useState } from 'react';
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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const [form, setForm] = useState<ProductForm>({
    ...EMPTY_FORM,
  });

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const [
        { data: prods, error: productsError },
        { data: cats, error: categoriesError },
      ] = await Promise.all([
        supabase
          .from('products')
          .select('*, category:categories(*)')
          .order('created_at', {
            ascending: false,
          }),

        supabase
          .from('categories')
          .select('*')
          .order('name', {
            ascending: true,
          }),
      ]);

      if (productsError) {
        console.error(
          '[ADMIN PRODUCTS] Load products error:',
          productsError,
        );

        toast.error(
          `โหลดสินค้าไม่สำเร็จ: ${productsError.message}`,
        );

        return;
      }

      if (categoriesError) {
        console.error(
          '[ADMIN PRODUCTS] Load categories error:',
          categoriesError,
        );

        toast.error(
          `โหลดหมวดหมู่ไม่สำเร็จ: ${categoriesError.message}`,
        );

        return;
      }

      setProducts(
        (prods as unknown as Product[]) ?? [],
      );

      setCategories(
        (cats as unknown as Category[]) ?? [],
      );
    } catch (error) {
      console.error(
        '[ADMIN PRODUCTS] Unexpected load error:',
        error,
      );

      toast.error(
        'เกิดข้อผิดพลาดในการโหลดข้อมูล',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const resetForm = () => {
    setForm({
      ...EMPTY_FORM,
    });

    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
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
      game_version:
        product.game_version ?? 'v1.0',
      thumbnail_url:
        product.thumbnail_url ?? '',
      category_id:
        product.category_id ?? '',
      featured:
        Boolean(product.featured),
      popular:
        Boolean(product.popular),
    });

    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    resetForm();
  };

  const slugify = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const save = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (saving) return;

    const title = form.title.trim();

    if (!title) {
      toast.error('กรุณาระบุชื่อสินค้า');
      return;
    }

    const price = Number.parseFloat(
      form.price,
    );

    if (!Number.isFinite(price) || price < 0) {
      toast.error(
        'กรุณาระบุราคาสินค้าให้ถูกต้อง',
      );

      return;
    }

    const discount = Number.parseInt(
      form.discount,
      10,
    );

    if (
      !Number.isFinite(discount) ||
      discount < 0 ||
      discount > 100
    ) {
      toast.error(
        'ส่วนลดต้องอยู่ระหว่าง 0 - 100%',
      );

      return;
    }

    const stock = Number.parseInt(
      form.stock,
      10,
    );

    if (!Number.isFinite(stock) || stock < 0) {
      toast.error(
        'จำนวนสินค้าในคลังไม่ถูกต้อง',
      );

      return;
    }

    setSaving(true);

    try {
      /*
       * ตรวจสอบ session ปัจจุบัน
       */
      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error(
          '[ADMIN PRODUCTS] Session error:',
          sessionError,
        );

        toast.error(
          `ตรวจสอบ Session ไม่สำเร็จ: ${sessionError.message}`,
        );

        return;
      }

      const session = sessionData.session;

      if (!session?.user) {
        toast.error(
          'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่',
        );

        return;
      }

      const role =
        session.user.app_metadata?.role;

      console.log(
        '[ADMIN PRODUCTS] Current user:',
        {
          id: session.user.id,
          email: session.user.email,
          role,
        },
      );

      if (role !== 'admin') {
        toast.error(
          'บัญชีนี้ไม่มีสิทธิ์ Admin',
        );

        return;
      }

      /*
       * Payload สำหรับ products
       */
      const payload = {
        title,
        slug: slugify(title),
        description:
          form.description.trim() || null,
        price,
        discount,
        stock,
        game_version:
          form.game_version.trim() || 'v1.0',
        thumbnail_url:
          form.thumbnail_url.trim() || null,
        category_id:
          form.category_id || null,
        featured: form.featured,
        popular: form.popular,
      };

      console.log(
        '[ADMIN PRODUCTS] Save payload:',
        payload,
      );

      /*
       * ============================
       * UPDATE
       * ============================
       */
      if (editing) {
        console.log(
          '[ADMIN PRODUCTS] Updating product:',
          editing.id,
        );

        const {
          data: updatedProducts,
          error: updateError,
        } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editing.id)
          .select('*');

        if (updateError) {
          console.error(
            '[ADMIN PRODUCTS] UPDATE ERROR:',
            updateError,
          );

          toast.error(
            `อัปเดตสินค้าไม่สำเร็จ: ${updateError.message}`,
          );

          return;
        }

        console.log(
          '[ADMIN PRODUCTS] UPDATE RESULT:',
          updatedProducts,
        );

        /*
         * ถ้าไม่มี row กลับมา
         * แปลว่า UPDATE ไม่ได้แตะสินค้า
         */
        if (
          !updatedProducts ||
          updatedProducts.length === 0
        ) {
          console.error(
            '[ADMIN PRODUCTS] UPDATE affected 0 rows',
          );

          toast.error(
            'ไม่สามารถอัปเดตสินค้าได้ ไม่พบข้อมูลหรือไม่มีสิทธิ์แก้ไข',
          );

          return;
        }

        /*
         * เอาข้อมูลที่เพิ่ง update
         * มาอัปเดต state ทันที
         */
        const updatedProduct =
          updatedProducts[0];

        setProducts((currentProducts) =>
          currentProducts.map((product) =>
            product.id === editing.id
              ? ({
                  ...product,
                  ...updatedProduct,
                } as Product)
              : product,
          ),
        );

        toast.success(
          'อัปเดตสินค้าสำเร็จ',
        );
      }

      /*
       * ============================
       * INSERT
       * ============================
       */
      else {
        console.log(
          '[ADMIN PRODUCTS] Creating product',
        );

        const {
          data: createdProducts,
          error: insertError,
        } = await supabase
          .from('products')
          .insert(payload)
          .select('*');

        if (insertError) {
          console.error(
            '[ADMIN PRODUCTS] INSERT ERROR:',
            insertError,
          );

          toast.error(
            `สร้างสินค้าไม่สำเร็จ: ${insertError.message}`,
          );

          return;
        }

        console.log(
          '[ADMIN PRODUCTS] INSERT RESULT:',
          createdProducts,
        );

        if (
          !createdProducts ||
          createdProducts.length === 0
        ) {
          toast.error(
            'สร้างสินค้าไม่สำเร็จ ไม่ได้รับข้อมูลกลับจาก Database',
          );

          return;
        }

        toast.success(
          'สร้างสินค้าสำเร็จ',
        );
      }

      /*
       * ปิด Modal
       */
      setShowForm(false);
      resetForm();

      /*
       * โหลดข้อมูลจาก Database ใหม่
       */
      await load();
    } catch (error) {
      console.error(
        '[ADMIN PRODUCTS] Save unexpected error:',
        error,
      );

      toast.error(
        'เกิดข้อผิดพลาดขณะบันทึกสินค้า',
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (deletingId) return;

    const confirmed =
      window.confirm(
        'คุณต้องการลบสินค้านี้ใช่หรือไม่?\n\nการดำเนินการนี้ไม่สามารถย้อนกลับได้',
      );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error(
          '[ADMIN PRODUCTS] Session error:',
          sessionError,
        );

        toast.error(
          `ตรวจสอบ Session ไม่สำเร็จ: ${sessionError.message}`,
        );

        return;
      }

      const session =
        sessionData.session;

      if (!session?.user) {
        toast.error(
          'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่',
        );

        return;
      }

      if (
        session.user.app_metadata?.role !==
        'admin'
      ) {
        toast.error(
          'บัญชีนี้ไม่มีสิทธิ์ Admin',
        );

        return;
      }

      const {
        data: deletedProducts,
        error: deleteError,
      } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .select('id');

      if (deleteError) {
        console.error(
          '[ADMIN PRODUCTS] DELETE ERROR:',
          deleteError,
        );

        toast.error(
          `ลบสินค้าไม่สำเร็จ: ${deleteError.message}`,
        );

        return;
      }

      console.log(
        '[ADMIN PRODUCTS] DELETE RESULT:',
        deletedProducts,
      );

      if (
        !deletedProducts ||
        deletedProducts.length === 0
      ) {
        toast.error(
          'ไม่พบสินค้า หรือไม่มีสิทธิ์ลบสินค้านี้',
        );

        return;
      }

      setProducts((currentProducts) =>
        currentProducts.filter(
          (product) =>
            product.id !== id,
        ),
      );

      toast.success(
        'ลบสินค้าสำเร็จ',
      );
    } catch (error) {
      console.error(
        '[ADMIN PRODUCTS] Delete unexpected error:',
        error,
      );

      toast.error(
        'เกิดข้อผิดพลาดขณะลบสินค้า',
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">
            จัดการสินค้า
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            สินค้าทั้งหมด {products.length} รายการ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void load()}
            disabled={loading || saving}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading
                  ? 'animate-spin'
                  : ''
              }`}
            />

            <span className="hidden sm:inline">
              รีเฟรช
            </span>
          </Button>

          <Button
            type="button"
            onClick={openCreate}
            disabled={saving}
            className="gradient-primary gap-2 text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            เพิ่มสินค้า
          </Button>
        </div>
      </div>

      {/* Products */}
      {loading ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-border bg-card">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            ยังไม่มีสินค้าในระบบ
          </p>

          <Button
            type="button"
            onClick={openCreate}
            className="mt-4 gradient-primary text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            สร้างสินค้าแรก
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-3"
            >
              {/* Thumbnail */}
              <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                {product.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.thumbnail_url}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                    ไม่มีรูป
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {product.title}
                </p>

                <p className="text-xs text-muted-foreground">
                  {product.category?.name ??
                    'ไม่มีหมวดหมู่'}
                  {' • '}
                  {product.game_version ??
                    'ไม่ระบุเวอร์ชัน'}
                  {' • '}
                  คลัง: {product.stock ?? 0}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
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

                <span className="hidden text-sm font-semibold sm:inline">
                  {formatPrice(
                    product.price,
                  )}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    openEdit(product)
                  }
                  disabled={
                    saving ||
                    deletingId !== null
                  }
                  aria-label={`แก้ไข ${product.title}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                >
                  <Pencil className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void remove(product.id)
                  }
                  disabled={
                    saving ||
                    deletingId ===
                      product.id ||
                    deletingId !== null
                  }
                  aria-label={`ลบ ${product.title}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
                >
                  {deletingId ===
                  product.id ? (
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

      {/* Edit / Create Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass-strong max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border p-6">
            {/* Modal Header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">
                  {editing
                    ? 'แก้ไขสินค้า'
                    : 'สร้างสินค้าใหม่'}
                </h3>

                {editing && (
                  <p className="mt-1 break-all text-xs text-muted-foreground">
                    ID: {editing.id}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label="ปิด"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={save}
              className="space-y-4"
            >
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  ชื่อสินค้า
                </Label>

                <Input
                  id="title"
                  required
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title:
                        event.target.value,
                    }))
                  }
                  className="bg-card"
                  disabled={saving}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="desc">
                  รายละเอียด
                </Label>

                <Textarea
                  id="desc"
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description:
                        event.target.value,
                    }))
                  }
                  className="bg-card"
                  rows={4}
                  disabled={saving}
                />
              </div>

              {/* Price / Discount */}
              <div className="grid grid-cols-2 gap-4">
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
                      setForm((current) => ({
                        ...current,
                        price:
                          event.target.value,
                      }))
                    }
                    className="bg-card"
                    disabled={saving}
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
                      setForm((current) => ({
                        ...current,
                        discount:
                          event.target.value,
                      }))
                    }
                    className="bg-card"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Stock / Version */}
              <div className="grid grid-cols-2 gap-4">
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
                      setForm((current) => ({
                        ...current,
                        stock:
                          event.target.value,
                      }))
                    }
                    className="bg-card"
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="version">
                    เวอร์ชันเกม
                  </Label>

                  <Input
                    id="version"
                    value={
                      form.game_version
                    }
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        game_version:
                          event.target.value,
                      }))
                    }
                    className="bg-card"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Thumbnail */}
              <div className="space-y-2">
                <Label htmlFor="thumb">
                  URL รูปภาพหน้าปก
                </Label>

                <Input
                  id="thumb"
                  type="url"
                  value={
                    form.thumbnail_url
                  }
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      thumbnail_url:
                        event.target.value,
                    }))
                  }
                  placeholder="https://..."
                  className="bg-card"
                  disabled={saving}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="cat">
                  หมวดหมู่
                </Label>

                <select
                  id="cat"
                  value={
                    form.category_id
                  }
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      category_id:
                        event.target.value,
                    }))
                  }
                  disabled={saving}
                  className="flex h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    ไม่มีหมวดหมู่
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {/* Flags */}
              <div className="space-y-3 rounded-xl border border-border bg-card/50 p-4">
                <label className="flex cursor-pointer items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={
                      form.featured
                    }
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          featured:
                            event.target
                              .checked,
                        }),
                      )
                    }
                    disabled={saving}
                    className="h-4 w-4 accent-primary"
                  />

                  <span>
                    <span className="block font-medium">
                      สินค้าแนะนำ
                    </span>

                    <span className="text-xs text-muted-foreground">
                      แสดงสินค้าในส่วน
                      Featured
                    </span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={
                      form.popular
                    }
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          popular:
                            event.target
                              .checked,
                        }),
                      )
                    }
                    disabled={saving}
                    className="h-4 w-4 accent-primary"
                  />

                  <span>
                    <span className="block font-medium">
                      สินค้ายอดนิยม
                    </span>

                    <span className="text-xs text-muted-foreground">
                      แสดงสินค้าในส่วน
                      Popular
                    </span>
                  </span>
                </label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={saving}
                className="w-full gradient-primary text-white hover:opacity-90"
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
