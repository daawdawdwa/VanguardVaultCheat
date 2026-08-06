'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type DownloadRow = {
  id: string;
  downloaded_at: string;
  count: number;
  file: { id: string; file_name: string; product: { title: string; slug: string } | null } | null;
};

export default function DownloadsPage() {
  const { user } = useAuth();
  const [downloads, setDownloads] = useState<DownloadRow[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('downloads')
      .select('id, downloaded_at, count, file:product_files(id, file_name, product:products(title, slug))')
      .eq('user_id', user.id)
      .order('downloaded_at', { ascending: false })
      .then(({ data }) => setDownloads((data as unknown as DownloadRow[]) ?? []));
  }, [user]);

  const triggerDownload = async (fileId: string, fileName: string) => {
    // Record download
    await supabase.from('downloads').insert({
      user_id: user!.id,
      file_id: fileId,
    });
    toast.success(`กำลังดาวน์โหลด ${fileName}...`);
    // In production this would generate a signed URL from Supabase Storage
  };

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-bold tracking-tight">ดาวน์โหลด</h1>

      {downloads.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Download className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">ยังไม่มีประวัติการดาวน์โหลด</p>
          <p className="mt-1 text-sm text-muted-foreground">
            ไฟล์ที่ซื้อจะปรากฏที่นี่เพื่อให้คุณเข้าถึงได้ตลอดชีพ
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {downloads.map((dl) => (
            <div
              key={dl.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{dl.file?.file_name ?? 'ไฟล์ไม่ทราบชื่อ'}</p>
                  <p className="text-xs text-muted-foreground">
                    {dl.file?.product?.title ? `${dl.file.product.title} • ` : ''}ดาวน์โหลดแล้ว {dl.count} ครั้ง
                  </p>
                </div>
              </div>
              {dl.file && (
                <Button size="sm" variant="outline" onClick={() => triggerDownload(dl.file!.id, dl.file!.file_name)}>
                  <Download className="mr-2 h-4 w-4" />
                  ดาวน์โหลด
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
