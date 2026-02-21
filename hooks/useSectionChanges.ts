import { useCallback, useState } from 'react';

export function useSectionChanges<T extends Record<string, any>>(initialData: T) {
  const [originalData, setOriginalData] = useState<T>(initialData);
  const [sectionChanges, setSectionChanges] = useState<Record<string, boolean>>({});

  const checkSectionChanges = useCallback((sectionKey: string, fields: (keyof T)[], currentData: T) => {
    const hasChanges = fields.some(field => currentData[field] !== originalData[field]);
    setSectionChanges(prev => ({ ...prev, [sectionKey]: hasChanges }));
    return hasChanges;
  }, [originalData]);

  const resetSection = useCallback((sectionKey: string, fields: (keyof T)[], setData: (data: T) => void, currentData: T) => {
    const resetData = { ...currentData };
    fields.forEach(field => {
      resetData[field] = originalData[field];
    });
    setData(resetData);
    setSectionChanges(prev => ({ ...prev, [sectionKey]: false }));
  }, [originalData]);

  const commitSection = useCallback((sectionKey: string, currentData: T) => {
    setOriginalData(currentData);
    setSectionChanges(prev => ({ ...prev, [sectionKey]: false }));
  }, []);

  const updateOriginalData = useCallback((data: T) => {
    setOriginalData(data);
    setSectionChanges({});
  }, []);

  return {
    sectionChanges,
    checkSectionChanges,
    resetSection,
    commitSection,
    updateOriginalData,
  };
}
