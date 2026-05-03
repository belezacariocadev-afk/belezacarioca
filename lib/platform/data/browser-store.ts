import { createInitialPlatformData, platformDataStorageKey } from '@/lib/platform/data/seed';
import { normalizeSubscriptionCommercialState } from '@/lib/platform/billing/commercial-access-policy';
import { normalizeSalonSettings } from '@/lib/platform/data/client-cancellation-policy';
import { normalizeProfessionalSchedule } from '@/lib/platform/data/professional-schedule';
import type { PlatformDataSnapshot } from '@/lib/platform/data/schema';

function isBrowser() {
  return typeof window !== 'undefined';
}

export function loadPlatformData(): PlatformDataSnapshot {
  if (!isBrowser()) {
    return createInitialPlatformData();
  }

  const rawValue = window.localStorage.getItem(platformDataStorageKey);

  if (!rawValue) {
    const seed = createInitialPlatformData();
    window.localStorage.setItem(platformDataStorageKey, JSON.stringify(seed));
    return seed;
  }

  try {
    const parsed = JSON.parse(rawValue) as PlatformDataSnapshot;

    if (parsed.version !== 1) {
      throw new Error('Unsupported platform data version');
    }

    const normalized = normalizePlatformData(parsed);
    savePlatformData(normalized);

    return normalized;
  } catch {
    const seed = createInitialPlatformData();
    window.localStorage.setItem(platformDataStorageKey, JSON.stringify(seed));
    return seed;
  }
}

function normalizePlatformData(snapshot: PlatformDataSnapshot): PlatformDataSnapshot {
  const appointments = snapshot.appointments ?? [];
  const now = new Date().toISOString();
  const professionals = (snapshot.professionals ?? []).map((professional) => ({
    ...professional,
    schedule: normalizeProfessionalSchedule(professional.schedule),
  }));
  const services = (snapshot.services ?? []).map((service) => ({
    ...service,
    category: service.category ?? 'Geral',
    active: service.active ?? true,
    professionalIds: service.professionalIds ?? professionals.map((professional) => professional.id),
    notes: service.notes,
    createdAt: service.createdAt ?? now,
    updatedAt: service.updatedAt ?? now,
  }));
  const charges = (snapshot.charges ?? []).map((charge) => {
    const appointment = appointments.find((item) => item.id === charge.appointmentId);

    return {
      ...charge,
      clientId: charge.clientId ?? appointment?.clientId,
      origin: charge.origin ?? (charge.subscriptionId ? 'subscription' : 'appointment'),
    };
  });

  return {
    ...snapshot,
    salon: {
      ...snapshot.salon,
      isPublic: snapshot.salon.isPublic ?? false,
      themeMode: snapshot.salon.themeMode === 'dark' ? 'dark' : 'light',
      primaryColor: normalizeHexColor(snapshot.salon.primaryColor),
      settings: normalizeSalonSettings(snapshot.salon.settings),
    },
    subscription: normalizeSubscriptionCommercialState(snapshot.subscription),
    professionals,
    professionalScheduleExceptions: snapshot.professionalScheduleExceptions ?? [],
    services,
    attendanceRecords: snapshot.attendanceRecords ?? [],
    accountClosures: snapshot.accountClosures ?? [],
    payments: snapshot.payments ?? [],
    charges,
  };
}

function normalizeHexColor(value?: string) {
  return /^#[0-9a-f]{6}$/i.test(value ?? '') ? (value as string) : '#7C3AED';
}

export function savePlatformData(snapshot: PlatformDataSnapshot) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(platformDataStorageKey, JSON.stringify(snapshot));
}

export function resetPlatformData() {
  const seed = createInitialPlatformData();
  savePlatformData(seed);

  return seed;
}
