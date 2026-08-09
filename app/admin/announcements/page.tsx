'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, X, RefreshCw } from 'lucide-react';

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

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState<AnnouncementForm>({
    title: '',
    content: '',
  });

  const load = async () => {
    try {
      setLoading(true);

      const {
        data,
        error,
      } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('ANNOUNCEMENTS LOAD ERROR:', error);
        toast.error(`โหลดประกาศไม่สำเร็จ: ${error.message}`);
        return;
      }

      setAnnouncements((data as Announcement[]) ?? []);
    } catch (error) {
      console.error('ANNOUNCEMENTS LOAD ERROR:', error);

      toast.error(
        error instanceof Error
          ? error.message
          : 'ไม่สามารถโหลดประกาศได้',
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
      title: '',
      content: '',
    });

    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);

    setForm({
      title: '',
      content: '',
    });
  };

  const create = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving) return;

    const title = form.title.trim();
    const content = form.content.trim();

    if (!title) {
      toast.error('กรุณากรอกหัวข้อประกาศ');
      return;
    }

    if (!content) {
      toast.error('กรุณากรอกเนื้อหาประกาศ');
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
        toast.error('บัญชีนี้ไม่มีสิทธิ์จัดการประกาศ');
        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from('announcements')
        .insert({
          title,
          content,
        })
        .select('*');

      if (error) {
        console.error('ANNOUNCEMENT CREATE ERROR:', error);

        toast.error(
          `สร้างประกาศไม่สำเร็จ: ${error.message}`,
        );

        return;
      }

      if (!data || data.length === 0) {
        toast.error('สร้างประกาศไม่สำเร็จ: ไม่พบข้อมูลที่ถูกสร้าง');

        return;
      }

      toast.success('เผยแพร่ประกาศสำเร็จ');

      setShowForm(false);

      setForm({
        title: '',
        content: '',
      });

      await load();
    } catch (error) {
      console.error('ANNOUNCEMENT CREATE ERROR:', error);

      toast.error(
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาดในการสร้างประกาศ',
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (deleting) return;

    const confirmed = window.confirm(
      'คุณต้องการลบประกาศนี้ใช่หรือไม่?\nการดำเนินการนี้ไม่สามารถย้อนกลับได้',
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
        toast.error('บัญชีนี้ไม่มีสิทธิ์ลบประกาศ');
        return;
      }

      const {
        data: deletedRows,
        error,
      } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id)
        .select('*');

      console.log('ANNOUNCEMENT DELETE RESULT:', {
        deletedRows,
        error,
      });

      if (error) {
        console.error('ANNOUNCEMENT DELETE ERROR:', error);

        toast.error(
          `ลบประกาศไม่สำเร็จ: ${error.message}`,
        );

        return;
      }

      if (!deletedRows || deletedRows.length === 0) {
        toast.error(
          'ลบประกาศไม่สำเร็จ: ไม่พบข้อมูลหรือไม่มีสิทธิ์ลบ',
        );

        return;
      }

      toast.success('ลบประกาศสำเร็จ');

      await load();
    } catch (error) {
      console.error('ANNOUNCEMENT DELETE ERROR:', error);

      toast.error(
        error instanceof Error
          ? error.message
          : 'ไม่สามารถลบประกาศได้',
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
            ประกาศทั้งหมด ({announcements.length})
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            จัดการข่าวสารและประกาศที่แสดงให้ลูกค้าเห็น
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
            สร้างประกาศ
          </Button>
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          ยังไม่มีประกาศในระบบ
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium">
                    {announcement.title}
                  </h3>

                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                    {announcement.content}
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {timeAgo(announcement.created_at)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void remove(announcement.id)}
                  disabled={deleting === announcement.id}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`ลบประกาศ ${announcement.title}`}
                >
                  {deleting === announcement.id ? (
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
                  สร้างประกาศใหม่
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  ประกาศจะถูกเผยแพร่บนหน้าเว็บไซต์
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

            <form
              onSubmit={create}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="announcement-title">
                  หัวข้อประกาศ
                </Label>

                <Input
                  id="announcement-title"
                  required
                  value={form.title}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      title: event.target.value,
                    })
                  }
                  className="bg-card"
                  placeholder="เช่น เปิดให้บริการแล้ว"
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="announcement-content">
                  เนื้อหา
                </Label>

                <Textarea
                  id="announcement-content"
                  required
                  value={form.content}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      content: event.target.value,
                    })
                  }
                  className="bg-card"
                  rows={6}
                  placeholder="เขียนรายละเอียดประกาศ..."
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
                    กำลังเผยแพร่...
                  </>
                ) : (
                  'เผยแพร่ประกาศ'
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
