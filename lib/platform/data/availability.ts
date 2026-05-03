import { getAppointmentConflict } from '@/lib/platform/data/repositories';
import { normalizeProfessionalSchedule } from '@/lib/platform/data/professional-schedule';
import type { PlatformDataSnapshot } from '@/lib/platform/data/schema';
import type { AppointmentStatus, ProfessionalSchedule, ProfessionalScheduleExceptionRecord, Weekday } from '@/lib/platform/domain';

export type AvailabilitySlot = {
  endsAt: string;
  label: string;
  startsAt: string;
  time: string;
};

export type AvailabilityRequest = {
  date: string;
  ignoredAppointmentId?: string;
  professionalId: string;
  serviceId: string;
  status?: AppointmentStatus;
};

export type AvailabilityConfig = {
  endTime: string;
  intervalMinutes: number;
  startTime: string;
};

export type AvailabilityBlockedRange = {
  endMinute: number;
  exception: ProfessionalScheduleExceptionRecord;
  startMinute: number;
};

export type AvailabilityScheduleContext = {
  breakEndMinute: number | null;
  breakStartMinute: number | null;
  dayExceptions: ProfessionalScheduleExceptionRecord[];
  endMinute: number | null;
  hasDayOff: boolean;
  isWorkingDay: boolean;
  manualBlocks: AvailabilityBlockedRange[];
  schedule: ProfessionalSchedule;
  specialHours?: ProfessionalScheduleExceptionRecord;
  startMinute: number | null;
  weekday: Weekday;
};

export const defaultAvailabilityConfig: AvailabilityConfig = {
  endTime: '18:00',
  intervalMinutes: 30,
  startTime: '09:00',
};

export function getAvailabilitySlots(
  snapshot: PlatformDataSnapshot,
  request: AvailabilityRequest,
  config: AvailabilityConfig = defaultAvailabilityConfig,
): AvailabilitySlot[] {
  const service = snapshot.services.find((item) => item.id === request.serviceId);
  const professional = snapshot.professionals.find((item) => item.id === request.professionalId);

  if (!service?.active || !professional?.active || !request.date) {
    return [];
  }

  if (service.professionalIds.length > 0 && !service.professionalIds.includes(professional.id)) {
    return [];
  }

  const context = getAvailabilityScheduleContext(snapshot, request.professionalId, request.date, config);

  if (!context || context.hasDayOff || !context.isWorkingDay) {
    return [];
  }

  const { breakEndMinute, breakStartMinute, endMinute, manualBlocks, startMinute } = context;

  if (startMinute === null || endMinute === null || endMinute <= startMinute) {
    return [];
  }

  const now = Date.now();
  const slots: AvailabilitySlot[] = [];

  for (let minute = startMinute; minute + service.durationMinutes <= endMinute; minute += config.intervalMinutes) {
    const time = formatMinutesAsTime(minute);
    const startsAt = localDateTimeToIso(request.date, time);
    const endsAt = new Date(new Date(startsAt).getTime() + service.durationMinutes * 60 * 1000).toISOString();

    if (new Date(startsAt).getTime() <= now) {
      continue;
    }

    if (
      breakStartMinute !== null &&
      breakEndMinute !== null &&
      breakEndMinute > breakStartMinute &&
      minute < breakEndMinute &&
      minute + service.durationMinutes > breakStartMinute
    ) {
      continue;
    }

    if (manualBlocks.some((block) => minute < block.endMinute && minute + service.durationMinutes > block.startMinute)) {
      continue;
    }

    const conflict = getAppointmentConflict(
      snapshot,
      {
        clientId: 'availability-check',
        professionalId: request.professionalId,
        serviceId: request.serviceId,
        startsAt,
        status: request.status ?? 'requested',
      },
      request.ignoredAppointmentId,
    );

    if (!conflict) {
      slots.push({
        endsAt,
        label: time,
        startsAt,
        time,
      });
    }
  }

  return slots;
}

export function getAvailabilityScheduleContext(
  snapshot: PlatformDataSnapshot,
  professionalId: string,
  date: string,
  config: AvailabilityConfig = defaultAvailabilityConfig,
): AvailabilityScheduleContext | null {
  const professional = snapshot.professionals.find((item) => item.id === professionalId);

  if (!professional?.active || !date) {
    return null;
  }

  const requestedDate = new Date(`${date}T00:00:00`);
  const weekday = requestedDate.getDay() as Weekday;
  const dayExceptions = getProfessionalDayExceptions(snapshot, professionalId, date);
  const hasDayOff = dayExceptions.some((exception) => exception.type === 'dayOff');
  const specialHours = dayExceptions.find(
    (exception) => exception.type === 'specialHours' && exception.startTime && exception.endTime,
  );
  const weeklySchedule = normalizeProfessionalSchedule(professional.schedule);
  const schedule = specialHours
    ? {
        ...weeklySchedule,
        active: true,
        weekdays: [weekday],
        startTime: specialHours.startTime!,
        endTime: specialHours.endTime!,
        breakStartTime: undefined,
        breakEndTime: undefined,
      }
    : weeklySchedule;
  const startMinute = parseTimeToMinutes(schedule.startTime) ?? parseTimeToMinutes(config.startTime);
  const endMinute = parseTimeToMinutes(schedule.endTime) ?? parseTimeToMinutes(config.endTime);
  const breakStartMinute = schedule.breakStartTime ? parseTimeToMinutes(schedule.breakStartTime) : null;
  const breakEndMinute = schedule.breakEndTime ? parseTimeToMinutes(schedule.breakEndTime) : null;
  const manualBlocks = dayExceptions
    .filter((exception) => exception.type === 'manualBlock')
    .map((exception) => ({
      endMinute: exception.endTime ? parseTimeToMinutes(exception.endTime) : endMinute,
      exception,
      startMinute: exception.startTime ? parseTimeToMinutes(exception.startTime) : startMinute,
    }))
    .filter(
      (block): block is AvailabilityBlockedRange =>
        block.startMinute !== null && block.endMinute !== null && block.endMinute > block.startMinute,
    );

  return {
    breakEndMinute,
    breakStartMinute,
    dayExceptions,
    endMinute,
    hasDayOff,
    isWorkingDay:
      !hasDayOff &&
      schedule.active &&
      schedule.weekdays.includes(weekday) &&
      startMinute !== null &&
      endMinute !== null &&
      endMinute > startMinute,
    manualBlocks,
    schedule,
    specialHours,
    startMinute,
    weekday,
  };
}

export function getProfessionalDayExceptions(
  snapshot: PlatformDataSnapshot,
  professionalId: string,
  date: string,
): ProfessionalScheduleExceptionRecord[] {
  return (snapshot.professionalScheduleExceptions ?? [])
    .filter((exception) => exception.professionalId === professionalId && exception.date === date)
    .sort((first, second) => first.type.localeCompare(second.type) || first.createdAt.localeCompare(second.createdAt));
}

function parseTimeToMinutes(value: string) {
  const [hour, minute] = value.split(':').map(Number);

  if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  return hour * 60 + minute;
}

function formatMinutesAsTime(value: number) {
  const hour = Math.floor(value / 60);
  const minute = value % 60;

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function localDateTimeToIso(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}
