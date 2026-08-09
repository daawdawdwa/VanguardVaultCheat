'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { Category } from '@/lib/types';

type CategoryForm = {
  name: string;
  description: string;
  image_url: string;
};

const emptyForm: CategoryForm = {
  name: '',
  description: '',
  image_url: '',
};

const slugify = (value: string) => {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

  return slug || `category-${Date.now()}`;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, image_url, created_at')
      .order('name', { ascending: true });

    if (error) {
      console.error('[AdminCategories] load error:', error);
      toast.error(`โหลดหมวดหมู่ไม่สำเร็จ: ${error.message}`);
      setCategories([]);
      setLoading(false);
      return;
    }

    setCategories((data as Category[]) ?? []);
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

  const openEdit = (category: Category) => {
    setEditing(category);

    setForm({
      name: category.name,
      description: category.description ?? '',
      image_url: category.image_url ?? '',
    });

    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const getUniqueSlug = async (
    name: string,
    currentId?: string,
  ): Promise<string> => {
    const baseSlug = slugify(name);

    const { data, error } = await supabase
      .from('categories')
      .select('id, slug')
      .ilike('slug', `${baseSlug}%`);

    if (error) {
      throw new Error(error.message);
    }

    const existing = (data ?? []).filter(
      (item) => item.id !== currentId,
    );

    if (!existing.some((item) => item.slug === baseSlug)) {
      return baseSlug;
    }

    let counter = 2;

    while (
      existing.some(
        (item) => item.slug === `${baseSlug}-${counter}`,
      )
    ) {
      counter += 1;
    }

    return `${baseSlug}-${counter}`;
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();
    const imageUrl = form.image_url.trim();

    if (!name) {
      toast.error('กรุณาระบุชื่อหมวดหมู่');
      return;
    }

    setSaving(true);

    try {
      const slug = await getUniqueSlug(name, editing?.id);

      if (editing) {
        const { data, error } = await supabase
          .from('categories')
          .update({
            name,
            slug,
            description: description || null,
            image_url: imageUrl || null,
          })
          .eq('id', editing.id)
          .select(
            'id, name, slug, description, image_url, created_at',
          )
          .single();

        if (error) {
          console.error('[AdminCategories] update error:', error);
          toast.error(`แก้ไขหมวดหมู่ไม่สำเร็จ: ${error.message}`);
          return;
        }

        if (!data) {
          toast.error('ไม่พบหมวดหมู่หรือไม่มีสิทธิ์แก้ไข');
          return;
        }

        toast.success('แก้ไขหมวดหมู่สำเร็จ');
      } else {
        const { data, error } = await supabase
          .from('categories')
          .insert({
            name,
            slug,
            description: description || null,
            image_url: imageUrl || null,
          })
          .select(
            'id, name, slug, description, image_url, created_at',
          )
          .single();

        if (error) {
          console.error('[AdminCategories] insert error:', error);
          toast.error(`สร้างหมวดหมู่ไม่สำเร็จ: ${error.message}`);
          return;
        }

        if (!data) {
          toast.error('ไม่สามารถสร้างหมวดหมู่ได้');
          return;
        }

        toast.success('สร้างหมวดหมู่สำเร็จ');
      }

      closeForm();
      await load();
    } catch (error) {
      console.error('[AdminCategories] save error:', error);

      toast.error(
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาดในการบันทึกหมวดหมู่',
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (category: Category) => {
    if (deletingId) return;

    const confirmed = window.confirm(
      `ต้องการลบหมวดหมู่ "${category.name}" ใช่หรือไม่?\n\nสินค้าในหมวดหมู่นี้จะถูกเปลี่ยนเป็น "ไม่มีหมวดหมู่" และจะไม่ถูกลบ`,
    );

    if (!confirmed) return;

    setDeletingId(category.id);

    try {
      const { data, error } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id)
        .select('id')
        .single();

      if (error) {
        console.error('[AdminCategories] delete error:', error);
        toast.error(`ลบหมวดหมู่ไม่สำเร็จ: ${error.message}`);
        return;
      }

      if (!data) {
        toast.error('ไม่พบหมวดหมู่หรือไม่มีสิทธิ์ลบ');
        return;
      }

      setCategories((current) =>
        current.filter((item) => item.id !== category.id),
      );

      toast.success('ลบหมวดหมู่สำเร็จ');
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
            หมวดหมู่ทั้งหมด ({categories.length})
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            จัดการหมวดหมู่สินค้าของร้าน
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreate}
          className="gradient-primary text-white hover:opacity-90"
        >
          <Plus className="mr-2 h-4 w-4" />
          เพิ่มหมวดหมู่
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            ยังไม่มีหมวดหมู่ในระบบ
          </p>

          <Button
            type="button"
            onClick={openCreate}
            variant="outline"
            className="mt-4"
          >
            <Plus className="mr-2 h-4 w-4" />
            สร้างหมวดหมู่แรก
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-card/80"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-secondary">
                {category.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={category.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                    {category.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold">
                  {category.name}
                </h3>

                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  /{category.slug}
                </p>

                {category.description && (
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {category.description}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(category)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label={`แก้ไข ${category.name}`}
                  title="แก้ไขหมวดหมู่"
                >
                  <Pencil className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => void remove(category)}
                  disabled={deletingId === category.id}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  aria-label={`ลบ ${category.name}`}
                  title="ลบหมวดหมู่"
                >
                  {deletingId === category.id ? (
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
                  {editing ? 'แก้ไขหมวดหมู่' : 'สร้างหมวดหมู่ใหม่'}
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Slug จะถูกสร้างให้อัตโนมัติ
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
                <Label htmlFor="category-name">
                  ชื่อหมวดหมู่
                </Label>

                <Input
                  id="category-name"
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="เช่น Valorant"
                  className="bg-card"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-description">
                  รายละเอียด
                </Label>

                <Textarea
                  id="category-description"
                  maxLength={1000}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="รายละเอียดหมวดหมู่..."
                  className="bg-card"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-image">
                  URL รูปภาพ
                </Label>

                <Input
                  id="category-image"
                  type="url"
                  value={form.image_url}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      image_url: event.target.value,
                    }))
                  }
                  placeholder="https://..."
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
                    'สร้างหมวดหมู่'
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
