// Core Time Calculation Engine
// Handles: DST, leap years, cross-day, UTC-safe calculations

export interface TimeDiffResult {
  totalSeconds: number;
  totalMinutes: number;
  totalHours: number;
  totalDays: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  decimalHours: string;
  formatted: string;
}

export interface AddSubtractResult {
  result: Date;
  resultISO: string;
  resultFormatted: string;
  resultTime24: string;
  resultTime12: string;
  resultDate: string;
}

export interface WorkHoursResult {
  grossHours: number;
  grossMinutes: number;
  breakMinutes: number;
  netHours: number;
  netMinutes: number;
  netDecimal: string;
  overtimeHours: number;
  formatted: string;
}

export interface CountdownResult {
  totalMs: number;
  totalSeconds: number;
  totalMinutes: number;
  totalHours: number;
  totalDays: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  targetDate: string;
}

export interface NowResult {
  baseTime: Date;
  resultTime: Date;
  baseFormatted: string;
  resultFormatted: string;
  baseTime24: string;
  resultTime24: string;
  baseTime12: string;
  resultTime12: string;
}

// ─── UTILITIES ───────────────────────────────────────────────────────────────

export function formatTime24(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function formatTime12(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(date: Date): string {
  return `${formatDate(date)}, ${formatTime24(date)}`;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatDuration(d: number, h: number, m: number, s: number): string {
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 && d === 0) parts.push(`${s}s`);
  return parts.join(' ') || '0s';
}

// ─── 1. TIME DIFFERENCE ──────────────────────────────────────────────────────

export function calcTimeDiff(startISO: string, endISO: string): TimeDiffResult {
  const start = new Date(startISO);
  const end = new Date(endISO);

  let diffMs = end.getTime() - start.getTime();
  const isNegative = diffMs < 0;
  diffMs = Math.abs(diffMs);

  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(diffMs / 60000);
  const totalHours = Math.floor(diffMs / 3600000);
  const totalDays = Math.floor(diffMs / 86400000);

  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);

  const decimalHours = (diffMs / 3600000).toFixed(2);
  const formatted = formatDuration(days, hours, minutes, seconds);

  return { totalSeconds, totalMinutes, totalHours, totalDays, days, hours, minutes, seconds, decimalHours, formatted };
}

// ─── 2. ADD / SUBTRACT ───────────────────────────────────────────────────────

export interface AddSubtractInput {
  baseISO: string;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  operation: 'add' | 'subtract';
}

export function calcAddSubtract(input: AddSubtractInput): AddSubtractResult {
  const base = new Date(input.baseISO);
  const deltaMs =
    ((input.days ?? 0) * 86400 +
      (input.hours ?? 0) * 3600 +
      (input.minutes ?? 0) * 60 +
      (input.seconds ?? 0)) * 1000;

  const result = new Date(
    input.operation === 'add'
      ? base.getTime() + deltaMs
      : base.getTime() - deltaMs,
  );

  return {
    result,
    resultISO: result.toISOString(),
    resultFormatted: formatDateTime(result),
    resultTime24: formatTime24(result),
    resultTime12: formatTime12(result),
    resultDate: formatDate(result),
  };
}

// ─── 3. WORK HOURS ───────────────────────────────────────────────────────────

export function calcWorkHours(
  startTime: string,  // "HH:MM"
  endTime: string,    // "HH:MM"
  breakMinutes: number,
): WorkHoursResult {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);

  let grossMinutes = eh * 60 + em - (sh * 60 + sm);
  if (grossMinutes < 0) grossMinutes += 24 * 60; // cross-midnight

  const grossHours = Math.floor(grossMinutes / 60);
  const netMinutes = Math.max(0, grossMinutes - breakMinutes);
  const netHours = Math.floor(netMinutes / 60);
  const remainMinutes = netMinutes % 60;
  const netDecimal = (netMinutes / 60).toFixed(2);
  const overtimeHours = Math.max(0, netMinutes / 60 - 8);
  const formatted = `${pad(netHours)}:${pad(remainMinutes)}`;

  return {
    grossHours,
    grossMinutes,
    breakMinutes,
    netHours,
    netMinutes,
    netDecimal,
    overtimeHours: parseFloat(overtimeHours.toFixed(2)),
    formatted,
  };
}

// ─── 4. COUNTDOWN ────────────────────────────────────────────────────────────

export function calcCountdown(targetISO: string): CountdownResult {
  const now = new Date();
  const target = new Date(targetISO);
  let diffMs = target.getTime() - now.getTime();
  const isPast = diffMs < 0;
  diffMs = Math.abs(diffMs);

  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(diffMs / 60000);
  const totalHours = Math.floor(diffMs / 3600000);
  const totalDays = Math.floor(diffMs / 86400000);

  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);

  return {
    totalMs: Math.abs(target.getTime() - now.getTime()),
    totalSeconds,
    totalMinutes,
    totalHours,
    totalDays,
    days,
    hours,
    minutes,
    seconds,
    isPast,
    targetDate: targetISO,
  };
}

// ─── 5. FROM NOW (now-based) ─────────────────────────────────────────────────

export interface NowInput {
  hours?: number;
  minutes?: number;
  days?: number;
  operation: 'add' | 'subtract';
}

export function calcFromNow(input: NowInput): NowResult {
  const base = new Date();
  const deltaMs =
    ((input.days ?? 0) * 86400 +
      (input.hours ?? 0) * 3600 +
      (input.minutes ?? 0) * 60) * 1000;

  const result = new Date(
    input.operation === 'add'
      ? base.getTime() + deltaMs
      : base.getTime() - deltaMs,
  );

  return {
    baseTime: base,
    resultTime: result,
    baseFormatted: formatDateTime(base),
    resultFormatted: formatDateTime(result),
    baseTime24: formatTime24(base),
    resultTime24: formatTime24(result),
    baseTime12: formatTime12(base),
    resultTime12: formatTime12(result),
  };
}

// ─── DURATION CALCULATOR ─────────────────────────────────────────────────────

export function calcDuration(hours: number, minutes: number): {
  totalMinutes: number;
  decimalHours: string;
  formatted: string;
} {
  const totalMinutes = hours * 60 + minutes;
  const decimalHours = (totalMinutes / 60).toFixed(2);
  const formatted = `${hours}h ${minutes}m`;
  return { totalMinutes, decimalHours, formatted };
}

// ─── LEAP YEAR CHECK ─────────────────────────────────────────────────────────

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// ─── TIME PARSING ─────────────────────────────────────────────────────────────

export function parseTimeString(time: string): { h: number; m: number } | null {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = parseInt(match[1]);
  const m = parseInt(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return { h, m };
}

// Build a local ISO string for today at given time
export function todayAtTime(time: string): string {
  const parsed = parseTimeString(time);
  if (!parsed) return new Date().toISOString();
  const d = new Date();
  d.setHours(parsed.h, parsed.m, 0, 0);
  return d.toISOString();
}
