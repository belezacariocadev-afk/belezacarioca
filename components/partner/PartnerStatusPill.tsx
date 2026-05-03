import type {
  ConversionStatus,
  LeadStatus,
  PaymentStatus,
} from '@/lib/partner/mockData';
import type { CommissionStatus, ReferralConversionStatus } from '@/lib/partner/program';

type StatusVariant = LeadStatus | ConversionStatus | PaymentStatus | ReferralConversionStatus | CommissionStatus;

const statusMeta: Record<
  StatusVariant,
  {
    label: string;
    classes: string;
  }
> = {
  novo: {
    label: 'Novo lead',
    classes: 'border-[rgba(107,76,157,0.3)] bg-[rgba(120,84,162,0.12)] text-[#5f3f86]',
  },
  em_contato: {
    label: 'Em contato',
    classes: 'border-[rgba(84,139,162,0.35)] bg-[rgba(84,139,162,0.15)] text-[#2f6a8a]',
  },
  proposta_enviada: {
    label: 'Proposta enviada',
    classes: 'border-[rgba(216,178,123,0.35)] bg-[rgba(216,178,123,0.2)] text-[#8d6a39]',
  },
  convertido: {
    label: 'Convertido',
    classes: 'border-[rgba(107,163,98,0.35)] bg-[rgba(107,163,98,0.2)] text-[#3f7d39]',
  },
  nao_avancou: {
    label: 'Nao avancou',
    classes: 'border-[rgba(167,95,95,0.3)] bg-[rgba(196,125,125,0.18)] text-[#8a4040]',
  },
  qualified: {
    label: 'Qualificado',
    classes: 'border-[rgba(107,163,98,0.35)] bg-[rgba(107,163,98,0.2)] text-[#3f7d39]',
  },
  subscribed: {
    label: 'Plano ativado',
    classes: 'border-[rgba(84,139,162,0.35)] bg-[rgba(84,139,162,0.15)] text-[#2f6a8a]',
  },
  paid: {
    label: 'Pagamento confirmado',
    classes: 'border-[rgba(107,163,98,0.35)] bg-[rgba(107,163,98,0.2)] text-[#3f7d39]',
  },
  canceled: {
    label: 'Cancelado',
    classes: 'border-[rgba(167,95,95,0.3)] bg-[rgba(196,125,125,0.18)] text-[#8a4040]',
  },
  clicked: {
    label: 'Clique no link',
    classes: 'border-[rgba(107,76,157,0.3)] bg-[rgba(120,84,162,0.12)] text-[#5f3f86]',
  },
  registered: {
    label: 'Cadastro iniciado',
    classes: 'border-[rgba(84,139,162,0.35)] bg-[rgba(84,139,162,0.15)] text-[#2f6a8a]',
  },
  pending: {
    label: 'Pendente',
    classes: 'border-[rgba(216,178,123,0.35)] bg-[rgba(216,178,123,0.2)] text-[#8d6a39]',
  },
  approved: {
    label: 'Aprovada',
    classes: 'border-[rgba(84,139,162,0.35)] bg-[rgba(84,139,162,0.15)] text-[#2f6a8a]',
  },
  pago: {
    label: 'Pago',
    classes: 'border-[rgba(107,163,98,0.35)] bg-[rgba(107,163,98,0.2)] text-[#3f7d39]',
  },
  em_processamento: {
    label: 'Em processamento',
    classes: 'border-[rgba(84,139,162,0.35)] bg-[rgba(84,139,162,0.15)] text-[#2f6a8a]',
  },
  agendado: {
    label: 'Agendado',
    classes: 'border-[rgba(216,178,123,0.35)] bg-[rgba(216,178,123,0.2)] text-[#8d6a39]',
  },
  falhou: {
    label: 'Falhou',
    classes: 'border-[rgba(167,95,95,0.3)] bg-[rgba(196,125,125,0.18)] text-[#8a4040]',
  },
};

type PartnerStatusPillProps = {
  status: StatusVariant;
};

export function PartnerStatusPill({ status }: PartnerStatusPillProps) {
  const meta = statusMeta[status];

  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em]',
        meta.classes,
      ].join(' ')}
    >
      {meta.label}
    </span>
  );
}
