import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, LayoutAnimation, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CollapsibleSectionProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onToggle?: (title: string) => void;
  onSave?: () => void | Promise<void>;
  onCancel?: () => void;
  hasChanges?: boolean;
  isSaving?: boolean;
}

export default function CollapsibleSection({
  title,
  icon,
  children,
  defaultExpanded = false,
  expanded: controlledExpanded,
  onToggle,
  onSave,
  onCancel,
  hasChanges = false,
  isSaving = false,
}: CollapsibleSectionProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: '#f9fafb', dark: '#1c1c1e' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#2c2c2e' }, 'background');

  // Use controlled state if provided, otherwise use internal state
  const expanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (onToggle) {
      onToggle(title);
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave();
      // Collapse the section after successful save
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      if (onToggle) {
        onToggle(title);
      } else {
        setInternalExpanded(false);
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: cardBg, borderColor }]}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: `${tintColor}15` }]}>
              <Ionicons name={icon as any} size={20} color={tintColor} />
            </View>
          )}
          <Text style={[styles.title, { color: textColor }]}>{title}</Text>
          {hasChanges && !expanded && (
            <View style={[styles.badge, { backgroundColor: tintColor }]}>
              <Text style={styles.badgeText}>•</Text>
            </View>
          )}
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={textColor}
        />
      </TouchableOpacity>

      {expanded && (
        <>
          <View style={styles.content}>{children}</View>
          
          {(onSave || onCancel) && (
            <View style={[styles.actions, { borderTopColor: borderColor }]}>
              {onCancel && (
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { borderColor }]}
                  onPress={handleCancel}
                  disabled={isSaving}
                >
                  <Text style={[styles.cancelButtonText, { color: textColor }]}>Cancel</Text>
                </TouchableOpacity>
              )}
              
              {onSave && (
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.saveButton,
                    { backgroundColor: tintColor },
                    !hasChanges && styles.saveButtonDisabled,
                  ]}
                  onPress={handleSave}
                  disabled={!hasChanges || isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 0,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    minHeight: 44,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
