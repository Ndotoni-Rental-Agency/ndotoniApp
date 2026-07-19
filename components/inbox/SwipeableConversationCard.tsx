import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface SwipeableConversationCardProps {
  conversation: any;
  onPress: () => void;
  onDelete: () => void;
  backgroundColor: string;
  textColor: string;
  secondaryText: string;
  tintColor: string;
  formatTime: (timestamp: string) => string;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

export default function SwipeableConversationCard({
  conversation,
  onPress,
  onDelete,
  backgroundColor,
  textColor,
  secondaryText,
  tintColor,
  formatTime,
  onSwipeStart,
  onSwipeEnd,
}: SwipeableConversationCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [isOpen, setIsOpen] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        const isSignificant = Math.abs(gestureState.dx) > 5;
        return isHorizontal && isSignificant;
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        const isSignificant = Math.abs(gestureState.dx) > 5;
        if (isHorizontal && isSignificant) {
          onSwipeStart?.();
          return true;
        }
        return false;
      },
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: () => {
        translateX.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          const newValue = Math.max(gestureState.dx, -80);
          translateX.setValue(newValue);
        } else if (isOpen) {
          const newValue = Math.min(gestureState.dx - 80, 0);
          translateX.setValue(newValue);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        onSwipeEnd?.();
        if (gestureState.dx < -40 || (isOpen && gestureState.dx < 20)) {
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: true,
            bounciness: 0,
            speed: 20,
          }).start();
          setIsOpen(true);
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
            speed: 20,
          }).start();
          setIsOpen(false);
        }
      },
      onPanResponderTerminate: () => {
        onSwipeEnd?.();
      },
    })
  ).current;

  const handleDelete = () => {
    Animated.timing(translateX, {
      toValue: -400,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDelete();
      translateX.setValue(0);
      setIsOpen(false);
    });
  };

  return (
    <View style={styles.swipeableContainer}>
      <View style={styles.deleteBackground}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.9}
        >
          <Ionicons name="trash" size={21} color="#fff" />
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[styles.cardWrapper, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[styles.messageCard, { backgroundColor }]}
          onPress={onPress}
          activeOpacity={0.95}
        >
          <View style={[styles.avatar, { backgroundColor: tintColor }]}>
            {conversation.otherPartyImage ? (
              <Text style={styles.avatarText}>
                {conversation.otherPartyName.charAt(0).toUpperCase()}
              </Text>
            ) : (
              <Ionicons name="person" size={26} color="#fff" />
            )}
          </View>

          <View style={styles.messageContent}>
            <View style={styles.messageHeader}>
              <Text style={[styles.senderName, { color: textColor }]} numberOfLines={1}>
                {conversation.otherPartyName?.split(' ')[0] || conversation.otherPartyName}
              </Text>
              <Text style={[styles.messageTime, { color: secondaryText }]}>
                {formatTime(conversation.lastMessageTime)}
              </Text>
            </View>

            {conversation.propertyTitle && (
              <View style={styles.propertyRow}>
                <Ionicons name="home" size={13} color={secondaryText} />
                <Text style={[styles.propertyTitle, { color: secondaryText }]} numberOfLines={1}>
                  {conversation.propertyTitle}
                </Text>
              </View>
            )}

            <View style={styles.previewRow}>
              <Text style={[styles.messagePreview, { color: secondaryText }]} numberOfLines={2}>
                {conversation.lastMessage}
              </Text>
              {conversation.unreadCount > 0 && (
                <View style={[styles.unreadBadge, { backgroundColor: tintColor }]}>
                  <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
                </View>
              )}
            </View>
          </View>

          <Ionicons name="chevron-forward" size={20} color={secondaryText} style={styles.chevron} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeableContainer: {
    position: 'relative',
    height: 88,
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    flex: 1,
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    height: 88,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  messageContent: {
    flex: 1,
    justifyContent: 'center',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  senderName: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  messageTime: {
    fontSize: 15,
  },
  propertyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  propertyTitle: {
    fontSize: 14,
    flex: 1,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messagePreview: {
    fontSize: 15,
    lineHeight: 20,
    flex: 1,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  chevron: {
    marginLeft: 8,
    opacity: 0.3,
  },
});
