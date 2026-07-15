import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { Platform, Switch, SwitchProps } from 'react-native';

interface AppSwitchProps extends Omit<SwitchProps, 'trackColor' | 'thumbColor' | 'ios_backgroundColor'> {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

/**
 * Reusable toggle switch with consistent, visible styling across light/dark modes.
 * Drop-in replacement for React Native's Switch.
 */
export default function AppSwitch({ value, onValueChange, ...rest }: AppSwitchProps) {
  const tint = useThemeColor({}, 'tint');

  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ true: tint, false: Platform.OS === 'ios' ? '#d1d5db' : '#e0e0e0' }}
      thumbColor={Platform.OS === 'android' ? (value ? '#fff' : '#f4f4f4') : undefined}
      ios_backgroundColor="#d1d5db"
      {...rest}
    />
  );
}
