import type { ProfessionalSchedule, Weekday } from '@/lib/platform/domain';

export const defaultProfessionalSchedule: ProfessionalSchedule = {
  active: true,
  weekdays: [1, 2, 3, 4, 5],
  startTime: '09:00',
  endTime: '18:00',
  breakStartTime: '12:00',
  breakEndTime: '13:00',
};

export function normalizeProfessionalSchedule(schedule?: Partial<ProfessionalSchedule> | null): ProfessionalSchedule {
  const weekdays = (schedule?.weekdays ?? defaultProfessionalSchedule.weekdays).filter(isWeekday);
  const breakStartTime = normalizeOptionalTime(schedule?.breakStartTime);
  const breakEndTime = normalizeOptionalTime(schedule?.breakEndTime);

  return {
    active: schedule?.active ?? defaultProfessionalSchedule.active,
    weekdays: weekdays.length > 0 ? weekdays : defaultProfessionalSchedule.weekdays,
    startTime: normalizeTime(schedule?.startTime) ?? defaultProfessionalSchedule.startTime,
    endTime: normalizeTime(schedule?.endTime) ?? defaultProfessionalSchedule.endTime,
    breakStartTime: breakStartTime ?? undefined,
    breakEndTime: breakEndTime ?? undefined,
  };
}

export function isWeekday(value: number): value is Weekday {
  return Number.isInteger(value) && value >= 0 && value <= 6;
}

function normalizeTime(value?: string) {
  if (!value) {
    return null;
  }

  return /^\d{2}:\d{2}$/.test(value) ? value : null;
}

function normalizeOptionalTime(value?: string) {
  const normalized = normalizeTime(value);

  return normalized || null;
}
