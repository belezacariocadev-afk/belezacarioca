import type { AccessProfileId, SalonRecord, SubscriptionRecord, SubscriptionStatus } from '@/lib/platform/domain';

export const trialLengthDays = 7;

export type CommercialAccessStatus = 'allowed' | 'requiresSubscription';

export type CommercialAccessReason =
  | 'clientAccess'
  | 'subscriptionActive'
  | 'trialActive'
  | 'trialExpired'
  | 'subscriptionBlocked'
  | 'subscriptionMissing'
  | 'salonUnavailable';

export type CommercialAccessResult = {
  status: CommercialAccessStatus;
  reason: CommercialAccessReason;
  message: string;
  redirectTo?: '/assinatura';
  plan?: SubscriptionRecord['plan'];
  billingCycle?: SubscriptionRecord['billingCycle'];
  subscriptionStatus?: SubscriptionStatus;
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  planLabel?: string;
  professionalRange?: string;
};

type CommercialAccessInput = {
  now?: Date;
  profileId: AccessProfileId;
  salon?: Pick<SalonRecord, 'status'> | null;
  subscription?: SubscriptionRecord | null;
};

export function normalizeSubscriptionCommercialState(
  subscription: SubscriptionRecord,
  now: Date = new Date(),
): SubscriptionRecord {
  const trialStartedAt = subscription.trialStartedAt ?? now.toISOString();
  const trialEndsAt =
    subscription.trialEndsAt ??
    subscription.currentPeriodEnd ??
    new Date(new Date(trialStartedAt).getTime() + trialLengthDays * 24 * 60 * 60 * 1000).toISOString();

  return {
    ...subscription,
    billingCycle: subscription.billingCycle ?? 'monthly',
    trialStartedAt: subscription.status === 'trialing' ? trialStartedAt : subscription.trialStartedAt,
    trialEndsAt: subscription.status === 'trialing' ? trialEndsAt : subscription.trialEndsAt,
  };
}

export function evaluateCommercialAccess({
  now = new Date(),
  profileId,
  salon,
  subscription,
}: CommercialAccessInput): CommercialAccessResult {
  if (profileId === 'client') {
    return {
      status: 'allowed',
      reason: 'clientAccess',
      message: 'Cliente nao precisa de assinatura para acessar.',
    };
  }

  if (!salon || salon.status !== 'active') {
    return requiresSubscription('salonUnavailable', subscription, 'O estabelecimento precisa regularizar o acesso para continuar.');
  }

  if (!subscription) {
    return requiresSubscription('subscriptionMissing', subscription, 'Ative um plano para liberar o portal do estabelecimento.');
  }

  const normalizedSubscription = normalizeSubscriptionCommercialState(subscription, now);

  if (normalizedSubscription.status === 'active') {
    const periodEnd = normalizedSubscription.currentPeriodEnd ? new Date(normalizedSubscription.currentPeriodEnd).getTime() : Number.NaN;

    if (Number.isFinite(periodEnd) && periodEnd <= now.getTime()) {
      return requiresSubscription(
        'subscriptionBlocked',
        normalizedSubscription,
        'O pagamento do plano nao foi identificado. Regularize para continuar usando o portal.',
      );
    }

    return {
      status: 'allowed',
      reason: 'subscriptionActive',
      message: 'Assinatura ativa. Acesso liberado.',
      ...getSubscriptionContext(normalizedSubscription),
    };
  }

  if (normalizedSubscription.status === 'trialing') {
    const trialEndsAt = normalizedSubscription.trialEndsAt ? new Date(normalizedSubscription.trialEndsAt).getTime() : Number.NaN;

    if (Number.isFinite(trialEndsAt) && trialEndsAt >= now.getTime()) {
      return {
        status: 'allowed',
        reason: 'trialActive',
        message: 'Teste gratis ativo. Acesso liberado.',
        ...getSubscriptionContext(normalizedSubscription),
      };
    }

    return requiresSubscription('trialExpired', normalizedSubscription, 'Seu teste gratis terminou. Escolha um plano para continuar.');
  }

  return requiresSubscription('subscriptionBlocked', normalizedSubscription, 'O status do plano precisa ser regularizado para continuar.');
}

function requiresSubscription(
  reason: Exclude<CommercialAccessReason, 'clientAccess' | 'subscriptionActive' | 'trialActive'>,
  subscription: SubscriptionRecord | null | undefined,
  message: string,
): CommercialAccessResult {
  return {
    status: 'requiresSubscription',
    reason,
    message,
    redirectTo: '/assinatura',
    ...(subscription ? getSubscriptionContext(subscription) : {}),
  };
}

function getSubscriptionContext(subscription: SubscriptionRecord) {
  return {
    billingCycle: subscription.billingCycle,
    currentPeriodEnd: subscription.currentPeriodEnd,
    plan: subscription.plan,
    subscriptionStatus: subscription.status,
    trialEndsAt: subscription.trialEndsAt,
  };
}
