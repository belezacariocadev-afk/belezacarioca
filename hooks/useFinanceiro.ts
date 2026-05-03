'use client';

import { useCallback, useMemo } from 'react';

import { usePlatformData } from '@/components/platform/PlatformDataProvider';
import type { ChargeRecord } from '@/lib/platform/domain';
import type { ChargeInput, ChargeUpdateInput, FinanceSummary } from '@/lib/platform/data/schema';

export function useFinanceiro() {
  const { actions, data, lastSyncError } = usePlatformData();
  const charges = useMemo(() => [...data.charges].sort((left, right) => right.createdAt.localeCompare(left.createdAt)), [data.charges]);
  const summary = useMemo(() => buildFinanceSummary(charges), [charges]);

  const fetchCharges = useCallback(async (): Promise<ChargeRecord[]> => charges, [charges]);
  const fetchSummary = useCallback(async (): Promise<FinanceSummary> => summary, [summary]);
  const createCharge = useCallback((input: ChargeInput) => actions.createCharge(input), [actions]);
  const updateCharge = useCallback((chargeId: string, input: ChargeUpdateInput) => actions.updateCharge(chargeId, input), [actions]);
  const deleteCharge = useCallback((chargeId: string) => actions.deleteCharge(chargeId), [actions]);

  return {
    charges,
    createCharge,
    deleteCharge,
    error: lastSyncError,
    fetchCharges,
    fetchSummary,
    summary,
    updateCharge,
  };
}

function buildFinanceSummary(charges: ChargeRecord[]): FinanceSummary {
  return {
    cancelled: charges.filter((charge) => charge.status === 'cancelled').length,
    draft: charges.filter((charge) => charge.status === 'draft').length,
    paid: charges.filter((charge) => charge.status === 'paid').length,
    pending: charges.filter((charge) => charge.status === 'pending').length,
  };
}
