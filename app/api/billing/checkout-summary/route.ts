import { NextResponse } from 'next/server';

import { readPlatformSessionFromRequest } from '@/lib/platform/auth/request-session';
import { isEstablishmentProfile } from '@/lib/platform/auth/session';
import { supabaseRestRequest } from '@/lib/platform/supabase/rest-client';

type SubscriptionIntentRow = {
  amount_cents: number | null;
  id: string;
  plan_label: string | null;
  professional_range: string | null;
  salon_id: string;
  selected_plan: string;
  status: string;
};

type ChargeRow = {
  amount_cents: number | null;
  checkout_url: string | null;
  due_date: string | null;
  provider_charge_id: string | null;
  service_name: string | null;
  status: string | null;
};

const fallbackPlanLabels: Record<string, string> = {
  monthly: 'Plano mensal',
  quarterly: 'Plano trimestral',
  annual: 'Plano anual',
};

const fallbackRangeLabels: Record<string, string> = {
  '1-2': '1 a 2 profissionais',
  '3-4': '3 a 4 profissionais',
  '5-10': '5 a 10 profissionais',
  '11-20': '11 a 20 profissionais',
  '21+': '21 ou mais profissionais',
};

export async function GET(request: Request) {
  const session = readPlatformSessionFromRequest(request);

  if (!session || !isEstablishmentProfile(session.profileId)) {
    return NextResponse.json({ message: 'Sessao obrigatoria para acessar o checkout.' }, { status: 401 });
  }

  const intentId = new URL(request.url).searchParams.get('intentId')?.trim();

  if (!intentId) {
    return NextResponse.json({ message: 'IntentId obrigatorio.' }, { status: 400 });
  }

  const intents = await supabaseRestRequest<SubscriptionIntentRow[]>('subscription_intents', {
    query:
      `id=eq.${encodeURIComponent(intentId)}` +
      '&select=id,salon_id,selected_plan,status,amount_cents,professional_range,plan_label&limit=1',
    useServiceRole: true,
  });
  const intent = intents[0];

  if (!intent || intent.salon_id !== session.salonId) {
    return NextResponse.json({ message: 'Checkout nao encontrado para este estabelecimento.' }, { status: 404 });
  }

  const charges = await supabaseRestRequest<ChargeRow[]>('charges', {
    query:
      `subscription_intent_id=eq.${encodeURIComponent(intentId)}` +
      '&select=amount_cents,checkout_url,due_date,provider_charge_id,service_name,status&order=created_at.desc&limit=1',
    useServiceRole: true,
  }).catch(() => []);
  const charge = charges[0] ?? null;

  return NextResponse.json({
    ok: true,
    amountCents: charge?.amount_cents ?? intent.amount_cents,
    checkoutUrl: charge?.checkout_url ?? null,
    paymentId: charge?.provider_charge_id ?? null,
    planName: intent.plan_label ?? fallbackPlanLabels[intent.selected_plan] ?? 'Plano Beleza Carioca',
    professionalRange: intent.professional_range,
    professionalRangeLabel: intent.professional_range ? fallbackRangeLabels[intent.professional_range] ?? intent.professional_range : null,
    status: charge?.status ?? intent.status,
  });
}
