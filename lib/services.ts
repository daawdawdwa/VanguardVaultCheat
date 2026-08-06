'use client';

import { supabase } from './supabase';
import type { Notification } from './types';

export function getDeviceInfo() {
  if (typeof navigator === 'undefined') return { device: 'unknown', browser: 'unknown', os: 'unknown', userAgent: '' };
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Unknown';
  const os = /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'macOS' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Linux/.test(ua) ? 'Linux' : 'Unknown';
  const device = /Mobile|Android|iPhone|iPad/.test(ua) ? 'Mobile' : 'Desktop';
  return { device, browser, os, userAgent: ua };
}

export async function logActivity(
  action: string,
  category: 'user' | 'admin' | 'affiliate' | 'security' | 'system' = 'user',
  details: Record<string, unknown> = {},
  userId?: string
) {
  try {
    const info = getDeviceInfo();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('activity_logs').insert({
      user_id: userId ?? user?.id ?? null,
      action,
      category,
      device: info.device,
      browser: info.browser,
      os: info.os,
      user_agent: info.userAgent,
      details,
    });
  } catch {
    // non-blocking
  }
}

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: Notification['type'] = 'info',
  linkUrl: string | null = null
) {
  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type,
      link_url: linkUrl,
    });
  } catch {
    // non-blocking
  }
}

export function generateReferralCode(username: string): string {
  const base = username.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'GV';
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${base}${suffix}`;
}

export function generateRedeemCode(prefix = 'GV'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${prefix}-${seg()}-${seg()}`;
}

export function generateApiKey(): string {
  const chars = 'abcdef0123456789';
  return `gvk_${Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')}`;
}
