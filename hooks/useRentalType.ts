/**
 * React Hook for Rental Type Management
 * Manages the current rental type (LONG_TERM or SHORT_TERM) across the app
 */

import { useState, useCallback } from 'react';

export enum RentalType {
  LONG_TERM = 'LONG_TERM',
  SHORT_TERM = 'SHORT_TERM',
}

export interface UseRentalTypeReturn {
  rentalType: RentalType;
  setRentalType: (type: RentalType) => void;
  isShortTerm: boolean;
  isLongTerm: boolean;
  toggleRentalType: () => void;
}

/**
 * Hook for managing rental type state
 */
export function useRentalType(
  initialType: RentalType = RentalType.LONG_TERM
): UseRentalTypeReturn {
  const [rentalType, setRentalTypeState] = useState<RentalType>(initialType);

  const setRentalType = useCallback((type: RentalType) => {
    setRentalTypeState(type);
  }, []);

  const toggleRentalType = useCallback(() => {
    setRentalTypeState(prev => 
      prev === RentalType.LONG_TERM ? RentalType.SHORT_TERM : RentalType.LONG_TERM
    );
  }, []);

  return {
    rentalType,
    setRentalType,
    isShortTerm: rentalType === RentalType.SHORT_TERM,
    isLongTerm: rentalType === RentalType.LONG_TERM,
    toggleRentalType,
  };
}
