import type {
  AccountClosureRecord,
  AccountClosureStatus,
  AppointmentRecord,
  AppointmentStatus,
  AttendanceRecord,
  ChargeRecord,
  ChargeStatus,
  ClientRecord,
  PaymentMethod,
  PaymentRecord,
  PaymentStatus,
  ProfessionalSchedule,
  ProfessionalScheduleExceptionRecord,
  ProfessionalScheduleExceptionType,
  ProfessionalRecord,
  SalonRecord,
  SalonSettings,
  ServiceRecord,
  SubscriptionRecord,
} from '@/lib/platform/domain';

export type PlatformDataSnapshot = {
  version: 1;
  salon: SalonRecord;
  subscription: SubscriptionRecord;
  publicBookingDiagnostics?: PublicBookingDiagnostics;
  clients: ClientRecord[];
  professionals: ProfessionalRecord[];
  professionalScheduleExceptions: ProfessionalScheduleExceptionRecord[];
  services: ServiceRecord[];
  appointments: AppointmentRecord[];
  attendanceRecords: AttendanceRecord[];
  accountClosures: AccountClosureRecord[];
  payments: PaymentRecord[];
  charges: ChargeRecord[];
  updatedAt: string;
};

export type PublicBookingDiagnostics = {
  activeEmployeesCount: number;
  activeProfessionalsCount: number;
  activeServicesCount: number;
  activeWorkingHoursCount: number;
  salonId: string;
};

export type ClientInput = {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
};

export type ProfessionalInput = {
  name: string;
  email: string;
  role: string;
  active: boolean;
  permissions: string[];
  schedule: ProfessionalSchedule;
  avatarUrl?: string;
};

export type ProfessionalScheduleExceptionInput = {
  professionalId: string;
  date: string;
  type: ProfessionalScheduleExceptionType;
  startTime?: string;
  endTime?: string;
  reason?: string;
};

export type ServiceInput = {
  name: string;
  category: string;
  durationMinutes: number;
  priceCents: number;
  active: boolean;
  professionalIds: string[];
  notes?: string;
};

export type SalonSettingsInput = SalonSettings;

export type SalonAppearanceInput = {
  coverUrl?: string;
  logoUrl?: string;
  primaryColor: string;
  salonIdOrSlug?: string;
  themeMode: 'light' | 'dark';
};

export type AppointmentInput = {
  clientId: string;
  professionalId: string;
  serviceId: string;
  startsAt: string;
  status: AppointmentStatus;
  notes?: string;
};

export type CreateAppointmentResult =
  | {
      ok: true;
      appointment: AppointmentRecord;
    }
  | {
      ok: false;
      message: string;
    };

export type UpdateAppointmentResult =
  | {
      ok: true;
      appointment: AppointmentRecord;
    }
  | {
      ok: false;
      message: string;
    };

export type UpdateAppointmentStatusResult =
  | {
      ok: true;
      appointment: AppointmentRecord;
    }
  | {
      ok: false;
      message: string;
    };

export type DeleteAppointmentResult =
  | {
      ok: true;
      mode: 'cancelled' | 'deleted';
      message: string;
    }
  | {
      ok: false;
      message: string;
    };

export type RespondAppointmentRequestInput = {
  message?: string;
  status: 'confirmed' | 'rejected';
};

export type RespondAppointmentRequestResult =
  | {
      ok: true;
      appointment: AppointmentRecord;
    }
  | {
      ok: false;
      message: string;
    };

export type UpdateAttendanceStatusResult =
  | {
      ok: true;
      attendance: AttendanceRecord;
    }
  | {
      ok: false;
      message: string;
    };

export type AccountClosureInput = {
  discountCents: number;
  additionCents: number;
  notes?: string;
  status: AccountClosureStatus;
};

export type UpsertAccountClosureResult =
  | {
      ok: true;
      accountClosure: AccountClosureRecord;
    }
  | {
      ok: false;
      message: string;
    };

export type PaymentInput = {
  amountCents: number;
  method: PaymentMethod;
  status: PaymentStatus;
};

export type RegisterPaymentResult =
  | {
      ok: true;
      payment: PaymentRecord;
    }
  | {
      ok: false;
      message: string;
    };

export type ChargeInput = {
  amountCents: number;
  clientName: string;
  dueDate?: string;
  serviceName: string;
  status: Extract<ChargeStatus, 'draft' | 'pending' | 'paid' | 'cancelled'>;
};

export type ChargeUpdateInput = Partial<ChargeInput>;

export type ChargeActionResult =
  | {
      ok: true;
      charge: ChargeRecord;
      message: string;
    }
  | {
      ok: false;
      message: string;
    };

export type DeleteChargeResult =
  | {
      ok: true;
      chargeId: string;
      message: string;
    }
  | {
      ok: false;
      message: string;
    };

export type DeleteServiceResult =
  | {
      ok: true;
      serviceId: string;
      message: string;
    }
  | {
      ok: false;
      message: string;
    };

export type FinanceSummary = Record<'draft' | 'pending' | 'paid' | 'cancelled', number>;

export type DeleteClientResult =
  | {
      ok: true;
      mode: 'archived' | 'deleted';
      message: string;
    }
  | {
      ok: false;
      message: string;
    };
