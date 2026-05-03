'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { capturePartnerReferralFromSearchParams } from '@/lib/partner/referralAttribution';

export function PartnerReferralCapture() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    const source = capturePartnerReferralFromSearchParams(nextSearchParams, pathname || '/');

    if (!source) {
      return;
    }

    void fetch('/api/parceiros/referral-capture', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        landingPath: source.landingPath,
        partnerCode: source.partnerCode,
        queryParam: source.queryParam,
        visitorKey: source.visitorKey,
      }),
      keepalive: true,
    }).catch(() => {
      // Client capture stays local even if server persistence is temporarily unavailable.
    });
  }, [pathname, searchParams]);

  return null;
}
