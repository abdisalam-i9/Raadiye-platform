import { getT } from '../i18n';

export function formatDate(value) {
  const t = getT();
  if (!value) return t.dates.unknown;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return t.dates.unknown;
  return `${date.getDate()} ${t.dates.months[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatChatTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const time = `${hours}:${minutes}`;
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return time;
  return `${date.getDate()} ${getT().dates.months[date.getMonth()]} ${time}`;
}

export function getCategoryName(category) {
  const other = getT().common.other;
  if (!category) return other;
  if (typeof category === 'string') return category;
  return category.name || other;
}

export function getCategorySlug(category) {
  if (!category) return 'other';
  if (typeof category === 'string') return category;
  return category.slug || 'other';
}

export function getItemImage(item) {
  return item?.image || '';
}

export function getCategoryImage(category) {
  if (!category || typeof category === 'string') return '';
  return category.image || '';
}

export function resolveImageUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  const api = import.meta.env.VITE_API_URL || '/api';
  if (/^https?:\/\//i.test(api)) {
    try {
      const origin = new URL(api).origin;
      return `${origin}${url.startsWith('/') ? url : `/${url}`}`;
    } catch {
      return url;
    }
  }
  return url.startsWith('/') ? url : `/${url}`;
}

export function getErrorMessage(error, fallback) {
  const t = getT();
  const resolved = fallback || t.errors.generic;
  if (!error) return resolved;
  const raw = typeof error === 'string' ? error : error.message;
  if (!raw) return resolved;
  return t.api[raw] || raw;
}
