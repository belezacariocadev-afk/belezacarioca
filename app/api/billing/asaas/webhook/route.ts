import { NextResponse } from 'next/server';

import { processAsaasWebhook } from '@/lib/platform/billing/asaas-webhook';

function validateAsaasWebhookToken(request: Request) {
  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN?.trim();

  if (!expectedToken) {
    return true;
  }

  const providedToken =
    request.headers.get('asaas-access-token') ??
    request.headers.get('x-asaas-access-token') ??
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();

  return providedToken === expectedToken;
}

export async function POST(request: Request) {
  if (!validateAsaasWebhookToken(request)) {
    return NextResponse.json(
      {
        message: 'Token do webhook Asaas invalido.',
      },
      { status: 401 },
    );
  }

  let payload: Record<string, unknown>;

  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      {
        message: 'Payload JSON invalido no webhook Asaas.',
      },
      { status: 400 },
    );
  }

  try {
    const result = await processAsaasWebhook({
      payload,
      receivedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Falha ao processar webhook financeiro do Asaas.',
      },
      { status: 500 },
    );
  }
}
