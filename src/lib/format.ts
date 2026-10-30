import type { Currency, Locale } from '@/types/models';

const MONTHS: Record<Locale, string[]> = {
  id: [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ],
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
};

const MONTHS_SHORT: Record<Locale, string[]> = {
  id: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

export const DAY_SHORT: Record<Locale, string[]> = {
  // Monday-first
  id: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};

export const DAY_LONG: Record<Locale, string[]> = {
  id: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
  en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
};

const CURRENCY_SYMBOL: Record<Currency, string> = {
  IDR: 'Rp',
  USD: '$',
};

const CURRENCY_DECIMALS: Record<Currency, number> = {
  IDR: 0,
  USD: 2,
};

/** Groups digits without relying on Intl, which is not always available in Hermes. */
function groupDigits(value: string, separator: string) {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

export function formatMoney(amount: number, currency: Currency, locale: Locale) {
  const safe = Number.isFinite(amount) ? amount : 0;
  const decimals = CURRENCY_DECIMALS[currency];
  const fixed = Math.abs(safe).toFixed(decimals);
  const [whole, fraction] = fixed.split('.');
  const thousandSeparator = locale === 'id' ? '.' : ',';
  const decimalSeparator = locale === 'id' ? ',' : '.';
  const grouped = groupDigits(whole, thousandSeparator);
  const number = fraction ? `${grouped}${decimalSeparator}${fraction}` : grouped;
  const symbol = CURRENCY_SYMBOL[currency];
  const prefix = currency === 'IDR' ? `${symbol} ` : symbol;
  return `${safe < 0 ? '-' : ''}${prefix}${number}`;
}

/** Raw grouped number used inside text inputs, without the currency prefix. */
export function formatNumberInput(amount: number, locale: Locale) {
  const separator = locale === 'id' ? '.' : ',';
  return groupDigits(String(Math.round(amount)), separator);
}

export function parseNumberInput(text: string) {
  const digits = text.replace(/[^\d]/g, '');
  if (!digits) return 0;
  return Math.min(Number(digits), Number.MAX_SAFE_INTEGER);
}

export function formatTime(iso: string) {
  const date = new Date(iso);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/** Example: "29 Okt 2026". */
export function formatDate(iso: string, locale: Locale) {
  const date = new Date(iso);
  return `${date.getDate()} ${MONTHS_SHORT[locale][date.getMonth()]} ${date.getFullYear()}`;
}

/** Example: "29 Oktober 2026". */
export function formatDateLong(iso: string, locale: Locale) {
  const date = new Date(iso);
  return `${date.getDate()} ${MONTHS[locale][date.getMonth()]} ${date.getFullYear()}`;
}

export function currencySymbol(currency: Currency) {
  return CURRENCY_SYMBOL[currency];
}

export function monthYearLabel(date: Date, locale: Locale) {
  return `${MONTHS[locale][date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDayShort(iso: string, locale: Locale) {
  const date = new Date(iso);
  const index = (date.getDay() + 6) % 7;
  return DAY_SHORT[locale][index];
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

export function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

/** Monday-based start of week at 00:00 local time. */
export function startOfWeek(date: Date) {
  const next = startOfDay(date);
  const day = (next.getDay() + 6) % 7;
  next.setDate(next.getDate() - day);
  return next;
}

export function endOfWeek(date: Date) {
  const start = startOfWeek(date);
  const next = new Date(start);
  next.setDate(next.getDate() + 7);
  next.setMilliseconds(next.getMilliseconds() - 1);
  return next;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** ISO date-time restored from a date input and a time input ("14:30"). */
export function combineDateAndTime(date: Date, time: string) {
  const [hours, minutes] = time.split(':').map((part) => Number(part));
  const next = new Date(date);
  next.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0, 0);
  return next;
}

export function toTimeInput(iso: string) {
  const date = new Date(iso);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function relativeDayLabel(iso: string, locale: Locale, labels: { today: string; yesterday: string }) {
  const date = new Date(iso);
  const now = new Date();
  if (isSameDay(date, now)) return labels.today;
  const yesterday = addDays(now, -1);
  if (isSameDay(date, yesterday)) return labels.yesterday;
  return formatDate(iso, locale);
}
