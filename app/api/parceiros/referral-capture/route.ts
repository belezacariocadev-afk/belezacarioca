import { NextResponse } from 'next/server';

import { capturePartnerReferral, normalizePartnerCode } from '@/lib/partner/persistence';
import type { ReferredAccountType } from '@/lib/partner/program';

type ReferralCapturePayload = {
  landingPath?: string;
  partnerCode?: string;
  queryParam?: string;
  referredAccountType?: ReferredAccountType | null;
  visitorKey?: string;
};

function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();

  if (!normalized) {
    return undefined;
  }

  return normalized.slice(0, maxLength);
}

function normalizeReferredAccountType(value: unknown) {
  if (value === 'customer' || value === 'establishment') {
    return value;
  }

  return null;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ReferralCapturePayload;
  const partnerCode = normalizePartnerCode(body.partnerCode ?? '');

  if (!partnerCode) {
    return NextResponse.json(
      {
        message: 'Codigo de parceiro invalido.',
      },
      { status: 400 },
    );
  }

  try {
    const result = await capturePartnerReferral({
      landingPath: sanitizeText(body.landingPath, 240),
      partnerCode,
      queryParam: sanitizeText(body.queryParam, 40),
      rawRef: body.partnerCode,
      referredAccountType: normalizeReferredAccountType(body.referredAccountType),
      visitorKey: sanitizeText(body.visitorKey, 120),
    });

    return NextResponse.json({
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Falha ao registrar origem de parceiro.',
      },
      { status: 500 },
    );
  }
}
