import type { AppointmentRecord, SalonRecord, SalonSettings } from '@/lib/platform/domain';

export const defaultClientCancellationLeadHours = 4;

export const defaultSalonSettings: SalonSettings = {
  clientCancellationLeadHours: defaultClientCancellationLeadHours,
};

export type ClientCancellationEligibility = {
  allowed: boolean;
  message: string;
};

export function normalizeSalonSettings(settings?: Partial<SalonSettings> | null): SalonSettings {
  const leadHours = Number(settings?.clientCancellationLeadHours);

  return {
    clientCancellationLeadHours: Number.isFinite(leadHours) ? Math.min(168, Math.max(0, Math.round(leadHours))) : defaultClientCancellationLeadHours,
  };
}

export function getClientCancellationLeadHours(salon?: Pick<SalonRecord, 'settings'>) {
  return normalizeSalonSettings(salon?.settings).clientCancellationLeadHours;
}

export function getClientCancellationEligibility(
  appointment: AppointmentRecord,
  salon?: Pick<SalonRecord, 'settings'>,
  now: Date = new Date(),
): ClientCancellationEligibility {
  const startsAt = new Date(appointment.startsAt).getTime();
  const currentTime = now.getTime();
  const leadHours = getClientCancellationLeadHours(salon);
  const leadTimeMs = leadHours * 60 * 60 * 1000;

  if (!Number.isFinite(startsAt) || !Number.isFinite(currentTime)) {
    return {
      allowed: false,
      message: 'Nao conseguimos validar o horario deste agendamento. Fale com o salao para cancelar.',
    };
  }

  if (startsAt <= currentTime) {
    return {
      allowed: false,
      message: 'Este horario ja passou. Fale com o salao para ajustar o atendimento.',
    };
  }

  if (startsAt - currentTime < leadTimeMs) {
    return {
      allowed: false,
      message: `Cancelamento pelo cliente disponivel apenas ate ${leadHours} horas antes do horario marcado. Fale com o salao para ajustar este atendimento.`,
    };
  }

  return {
    allowed: true,
    message: `Cancelamento permitido ate ${leadHours} horas antes do horario marcado.`,
  };
}
