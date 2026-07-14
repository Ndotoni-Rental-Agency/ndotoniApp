import React from 'react';
import { EditTabProps } from './types';
import { BasicInfoSection, LocationSection, PricingSection, CapacitySection, AmenitiesSection } from './sections';

export default function EditDetailsTab(props: EditTabProps) {
  return (
    <>
      <BasicInfoSection {...props} />
      <LocationSection {...props} />
      <PricingSection {...props} />
      <CapacitySection {...props} />
      <AmenitiesSection {...props} />
    </>
  );
}
