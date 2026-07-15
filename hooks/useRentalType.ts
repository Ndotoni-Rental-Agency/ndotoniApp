/**
 * React Hook for Rental Type Management
 * This app is short-term only. The enum is kept for API compatibility.
 */

import { useState, useCallback } from 'react';

export enum RentalType {
  SHORT_TERM = 'SHORT_TERM',
}

export interface UseRentalTypeReturn {
  rentalType: RentalType;
  setRentalType: (type: RentalType) => void;
  isShortTerm: boolean;
}

/**
 * Hook for managing rental type state (short-term only)
 */
export function useRentalType(): UseRentalTypeReturn {
  const [rentalType, setRentalTypeState] = useState<RentalType>(RentalType.SHORT_TERM);

  const setRentalType = useCallback((type: RentalType) => {
    setRentalTypeState(type);
  }, []);

  return {
    rentalType,
    setRentalType,
    isShortTerm: true,
  };
}
