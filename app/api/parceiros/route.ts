import { NextResponse } from 'next/server';

import { upsertPartnerLeadRecord } from '@/lib/partner/approval';

type PartnerLeadPayload = {
  fullName: string;
  email: string;
  whatsapp: string;
  city: string;
  state: string;
  company?: string;
  areaOfWork: string;
  referralPlan: string;
  alreadyWorksWithBeauty: '' | 'sim' | 'nao';
  additionalMessage?: string;
  acceptedTerms: boolean;
};

function getStringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function getErrorMessage(payload: PartnerLeadPayload) {
  if (!payload.fullName) return 'Nome completo e obrigatorio.';
  if (!payload.email) return 'E-mail e obrigatorio.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) return 'E-mail invalido.';

  const whatsappDigits = payload.whatsapp.replace(/\D/g, '');
  if (whatsappDigits.length < 10) return 'WhatsApp invalido.';

  if (!payload.city) return 'Cidade e obrigatoria.';
  if (!payload.state) return 'Estado e obrigatorio.';
  if (!payload.areaOfWork) return 'Area de atuacao e obrigatoria.';
  if (!payload.referralPlan) return 'Explique como pretende atuar como parceiro.';
  if (!['sim', 'nao'].includes(payload.alreadyWorksWithBeauty)) return 'Selecione se ja atua no setor da beleza.';
  if (!payload.acceptedTerms) return 'E necessario aceitar o envio dos dados.';

  return null;
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Payload invalido.' }, { status: 400 });
  }

  const rawPayload = body as Record<string, unknown>;

  const payload: PartnerLeadPayload = {
    fullName: getStringValue(rawPayload.fullName),
    email: getStringValue(rawPayload.email).toLowerCase(),
    whatsapp: getStringValue(rawPayload.whatsapp),
    city: getStringValue(rawPayload.city),
    state: getStringValue(rawPayload.state),
    company: getStringValue(rawPayload.company),
    areaOfWork: getStringValue(rawPayload.areaOfWork),
    referralPlan: getStringValue(rawPayload.referralPlan),
    alreadyWorksWithBeauty:
      rawPayload.alreadyWorksWithBeauty === 'sim' || rawPayload.alreadyWorksWithBeauty === 'nao'
        ? rawPayload.alreadyWorksWithBeauty
        : '',
    additionalMessage: getStringValue(rawPayload.additionalMessage),
    acceptedTerms: Boolean(rawPayload.acceptedTerms),
  };

  const errorMessage = getErrorMessage(payload);

  if (errorMessage) {
    return NextResponse.json({ message: errorMessage }, { status: 400 });
  }

  try {
    const result = await upsertPartnerLeadRecord(payload);

    if (!result) {
      return NextResponse.json(
        {
          message: 'Servico de parceiros indisponivel no momento. Tente novamente em instantes.',
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        message: 'Cadastro enviado com sucesso. Seu perfil foi registrado para analise.',
        requestId: result.requestId,
        status: result.status,
        statusUrl: `/parceiro/solicitacao?id=${encodeURIComponent(result.requestId)}`,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Erro ao registrar lead de parceiro:', error);
    return NextResponse.json(
      {
        message: 'Nao foi possivel registrar seu cadastro agora. Tente novamente em instantes.',
      },
      { status: 500 },
    );
  }
}
