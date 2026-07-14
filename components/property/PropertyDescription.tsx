import React, { useCallback, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PropertyDescriptionProps {
  description: string;
  textColor: string;
  tintColor: string;
}

const COLLAPSED_LINES = 5;
const LINE_HEIGHT = 24;
const COLLAPSED_HEIGHT = COLLAPSED_LINES * LINE_HEIGHT;

export default function PropertyDescription({
  description,
  textColor,
  tintColor,
}: PropertyDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const [fullHeight, setFullHeight] = useState(0);

  const needsTruncation = fullHeight > COLLAPSED_HEIGHT;

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    if (fullHeight === 0) {
      setFullHeight(e.nativeEvent.layout.height);
    }
  }, [fullHeight]);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: textColor }]}>About this place</Text>

      {/* Hidden full-height measurer (rendered once, off-screen) */}
      {fullHeight === 0 && (
        <Text
          style={[styles.description, { color: textColor, position: 'absolute', opacity: 0 }]}
          onLayout={onLayout}
        >
          {description}
        </Text>
      )}

      {/* Visible description */}
      <Text
        style={[styles.description, { color: textColor }]}
        numberOfLines={!expanded && needsTruncation ? COLLAPSED_LINES : undefined}
      >
        {description}
      </Text>

      {needsTruncation && (
        <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.toggle}>
          <Text style={[styles.toggleText, { color: tintColor }]}>
            {expanded ? 'Show less' : 'Show more ›'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: LINE_HEIGHT,
  },
  toggle: {
    marginTop: 10,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
