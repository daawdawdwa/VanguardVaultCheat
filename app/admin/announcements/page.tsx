'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { Announcement } from '@/lib/types';
import { timeAgo } from '@/lib/helpers';

type AnnouncementForm = {
  title: string;
  content: string;
};

const emptyForm: AnnouncementForm = {
  title: '',
  content: '',
};

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState<AnnouncementForm>(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('announcements')
      .select('id, title, content, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[AdminAnnouncements] load error:', error);
      toast.error(`โหลดประกาศไม่สำเร็จ: ${error.message}`);
      setAnnouncements([]);
      setLoading(false);
      return;
    }

    setAnnouncements((data as Announcement[]) ?? []);
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

  const openEdit = (announcement: Announcement) => {
    setEditing(announcement);
    setForm({
      title: announcement.title,
      content: announcement.content,
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

    const title = form.title.trim();
    const content = form.content.trim();

    if (!title) {
      toast.error('กรุณาระบุหัวข้อประกาศ');
      return;
    }

    if (!content) {
      toast.error('กรุณาระบุเนื้อหาประกาศ');
      return;
    }

    setSaving(true);

    try {
      if (editing) {
        const { data, error } = await supabase
          .from('announcements')
          .update({
            title,
            content,
          })
          .eq('id', editing.id)
          .select('id')
          .single();

        if (error) {
          console.error('[AdminAnnouncements] update error:', error);
          toast.error(`แก้ไขประกาศไม่สำเร็จ: ${error.message}`);
          return;
        }

        if (!data) {
          toast.error('ไม่พบประกาศหรือไม่มีสิทธิ์แก้ไข');
          return;
        }

        toast.success('แก้ไขประกาศสำเร็จ');
      } else {
        const { data, error } = await supabase
          .from('announcements')
          .insert({
            title,
            content,
          })
          .select('id')
          .single();

        if (error) {
          console.error('[AdminAnnouncements] insert error:', error);
          toast.error(`สร้างประกาศไม่สำเร็จ: ${error.message}`);
          return;
        }

        if (!data) {
          toast.error('ไม่สามารถสร้างประกาศได้');
          return;
        }

        toast.success('เผยแพร่ประกาศสำเร็จ');
      }

      closeForm();
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (deletingId) return;

    const confirmed = window.confirm(
      'คุณต้องการลบประกาศนี้ใช่หรือไม่?\n\nการลบจะไม่สามารถย้อนกลับได้',
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      const { data, error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id)
        .select('id')
        .single();

      if (error) {
        console.error('[AdminAnnouncements] delete error:', error);
        toast.error(`ลบประกาศไม่สำเร็จ: ${error.message}`);
        return;
      }

      if (!data) {
        toast.error('ไม่พบประกาศหรือไม่มีสิทธิ์ลบ');
        return;
      }

      toast.success('ลบประกาศสำเร็จ');

      setAnnouncements((current) =>
        current.filter((announcement) => announcement.id !== id),
      );
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
            ประกาศทั้งหมด ({announcements.length})
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            จัดการประกาศที่แสดงในระบบ
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreate}
          className="gradient-primary text-white hover:opacity-90"
        >
          <Plus className="mr-2 h-4 w-4" />
          สร้างประกาศ
        </Button>
      </div>

      {announcements.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            ยังไม่มีประกาศในระบบ
          </p>

          <Button
            type="button"
            onClick={openCreate}
            variant="outline"
            className="mt-4"
          >
            <Plus className="mr-2 h-4 w-4" />
            สร้างประกาศแรก
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-card/80"
            >
              <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold">
                    {announcement.title}
                  </h3>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {announcement.content}
                  </p>

                  <p className="mt-3 text-xs text-muted-foreground">
                    {timeAgo(announcement.created_at)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(announcement)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label={`แก้ไข ${announcement.title}`}
                    title="แก้ไขประกาศ"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => void remove(announcement.id)}
                    disabled={deletingId === announcement.id}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
                    aria-label={`ลบ ${announcement.title}`}
                    title="ลบประกาศ"
                  >
                    {deletingId === announcement.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass-strong max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">
                  {editing ? 'แก้ไขประกาศ' : 'สร้างประกาศใหม่'}
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
                <Label htmlFor="announcement-title">หัวข้อประกาศ</Label>

                <Input
                  id="announcement-title"
                  required
                  maxLength={200}
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  className="bg-card"
                  placeholder="เช่น เปิดให้บริการระบบใหม่"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="announcement-content">เนื้อหาประกาศ</Label>

                <Textarea
                  id="announcement-content"
                  required
                  maxLength={5000}
                  value={form.content}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      content: event.target.value,
                    }))
                  }
                  className="min-h-32 bg-card"
                  rows={5}
                  placeholder="รายละเอียดประกาศ..."
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
                    'เผยแพร่ประกาศ'
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
