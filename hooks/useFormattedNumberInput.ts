import { useState, useEffect, useCallback } from 'react';
import { formatNumberWithCommas, parseFormattedNumber } from '@/lib/utils/common';

export function useFormattedNumberInput(
  value: string,
  onChange: (value: string) => void
) {
  const [displayValue, setDisplayValue] = useState<string>('');

  useEffect(() => {
    if (value === '') {
      setDisplayValue('');
    } else {
      const formatted = formatNumberWithCommas(value);
      setDisplayValue(formatted);
    }
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      const rawValue = parseFormattedNumber(inputValue);
      
      const formatted = formatNumberWithCommas(rawValue);
      setDisplayValue(formatted);
      
      onChange(rawValue);
    },
    [onChange]
  );

  return {
    displayValue,
    handleChange,
  };
}

