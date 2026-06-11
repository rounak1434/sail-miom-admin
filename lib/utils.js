import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date, fmt = 'dd MMM yyyy') {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '—';
  return format(d, fmt);
}

export function formatDateTime(date) {
  return formatDate(date, 'dd MMM yyyy, hh:mm a');
}

export function timeAgo(date) {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '—';
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatFileSize(bytes) {
  if (!bytes) return '—';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  // Clamp the index so sub-byte values (negative log) and >1024TB values
  // never index past the array and render "undefined".
  const i = Math.min(Math.max(0, Math.floor(Math.log(bytes) / Math.log(1024))), sizes.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

export function truncate(str, len = 40) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
}

export function getInitials(name) {
  if (!name) return '??';
  const initials = name
    .split(' ')
    .filter(Boolean) // skip empty segments from consecutive/leading spaces
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return initials || '??';
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function getSlaColor(percentage) {
  if (percentage >= 90) return 'text-green-600';
  if (percentage >= 70) return 'text-yellow-600';
  return 'text-red-600';
}

export function getSlaStatus(deadline) {
  if (!deadline) return null;
  const now = new Date();
  const d = typeof deadline === 'string' ? parseISO(deadline) : deadline;
  const diffMs = d - now;
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffMs < 0) return { label: 'Breached', color: 'text-red-600 bg-red-50 border-red-200' };
  if (diffHours < 2) return { label: 'Critical', color: 'text-red-600 bg-red-50 border-red-200' };
  if (diffHours < 6) return { label: 'Warning', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
  return { label: 'On Track', color: 'text-green-600 bg-green-50 border-green-200' };
}

export function greetingByTime() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function buildQueryString(params) {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return q ? `?${q}` : '';
}
