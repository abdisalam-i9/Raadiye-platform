import { so } from '../i18n/so';

const SO_MONTHS = [
  'Janaayo',
  'Febraayo',
  'Maarso',
  'Abriil',
  'Maajo',
  'Juun',
  'Luuliyo',
  'Agoosto',
  'Sebteembar',
  'Oktoobar',
  'Nofeembar',
  'Diseembar',
];

export function formatDate(value) {
  if (!value) return 'Taariikh lama hayo';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Taariikh lama hayo';
  return `${date.getDate()} ${SO_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function getCategoryName(category) {
  if (!category) return 'Kale';
  if (typeof category === 'string') return category;
  return category.name || 'Kale';
}

export function getCategorySlug(category) {
  if (!category) return 'other';
  if (typeof category === 'string') return category;
  return category.slug || 'other';
}

export function getItemImage(item) {
  if (item?.image) return item.image;
  if (item?.category?.image) return item.category.image;
  return '';
}

export function getErrorMessage(error, fallback = 'Waxbaa qaldamay. Fadlan mar kale isku day.') {
  if (!error) return fallback;
  const raw = typeof error === 'string' ? error : error.message;
  if (!raw) return fallback;
  return so.api[raw] || raw;
}
