import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import type { CardData, CardPosition } from '@/types/area-detail';
import { CARD_WIDTH, CARD_HEIGHT } from './constants';

interface CardProps {
  card: CardData;
  removeZoneTop: number;
  onMove: (id: string, position: CardPosition) => void;
  onRemove: (id: string) => void;
  onSelect: (card: CardData) => void;
  onStartConnection: (cardId: string, startPoint: CardPosition) => void;
  onUpdateConnection: (point: CardPosition | null) => void;
  onEndConnection: (cardId: string, point: CardPosition | null) => void;
  setIsDragging: (dragging: boolean) => void;
  onToggleRemoveZone: (active: boolean) => void;
}

export function Card({
  card,
  removeZoneTop,
  onMove,
  onRemove,
  onSelect,
  onStartConnection,
  onUpdateConnection,
  onEndConnection,
  setIsDragging,
  onToggleRemoveZone,
}: CardProps) {
  const translateX = useSharedValue(card.position.x);
  const translateY = useSharedValue(card.position.y);
  const isOverRemoveZone = useSharedValue(false);

  useEffect(() => {
    translateX.value = card.position.x;
    translateY.value = card.position.y;
  }, [card.position.x, card.position.y, translateX, translateY]);

  const cardPan = Gesture.Pan()
    .runOnJS(true)
    .onBegin(() => {
      setIsDragging(true);
    })
    .onUpdate((event) => {
      translateX.value = card.position.x + event.translationX;
      translateY.value = card.position.y + event.translationY;
      const hoveringRemoveZone = event.absoluteY >= removeZoneTop;
      if (hoveringRemoveZone !== isOverRemoveZone.value) {
        isOverRemoveZone.value = hoveringRemoveZone;
        onToggleRemoveZone(hoveringRemoveZone);
      }
    })
    .onEnd((event) => {
      const newX = card.position.x + event.translationX;
      const newY = card.position.y + event.translationY;
      const dropOnRemoveZone = event.absoluteY >= removeZoneTop;

      if (dropOnRemoveZone) {
        onRemove(card.id);
      } else {
        onMove(card.id, { x: newX, y: newY });
      }

      if (isOverRemoveZone.value) {
        isOverRemoveZone.value = false;
        onToggleRemoveZone(false);
      }
      setIsDragging(false);
    });

  const createConnectionGesture = (direction: 'left' | 'right') => {
    let startPoint: CardPosition | null = null;

    return Gesture.Pan()
      .runOnJS(true)
      .onBegin(() => {
        const offsetX = direction === 'left' ? 0 : CARD_WIDTH;
        startPoint = {
          x: card.position.x + offsetX,
          y: card.position.y + CARD_HEIGHT / 2,
        };
        onStartConnection(card.id, startPoint!);
      })
      .onChange((event) => {
        if (!startPoint) return;
        const point: CardPosition = {
          x: startPoint.x + event.translationX,
          y: startPoint.y + event.translationY,
        };
        onUpdateConnection(point);
      })
      .onEnd((event) => {
        if (!startPoint) {
          onEndConnection(card.id, null);
          return;
        }
        const point: CardPosition = {
          x: startPoint.x + event.translationX,
          y: startPoint.y + event.translationY,
        };
        onEndConnection(card.id, point);
        startPoint = null;
      })
      .onFinalize(() => {
        onUpdateConnection(null);
        if (isOverRemoveZone.value) {
          isOverRemoveZone.value = false;
          onToggleRemoveZone(false);
        }
      });
  };

  const leftConnection = createConnectionGesture('left');
  const rightConnection = createConnectionGesture('right');

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      {
        scale: withTiming(isOverRemoveZone.value ? 0.92 : 1, {
          duration: 160,
        }),
      },
    ],
    opacity: withTiming(isOverRemoveZone.value ? 0.65 : 1, {
      duration: 160,
    }),
  }));

  return (
    <GestureDetector gesture={cardPan}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            zIndex: 10,
          },
          animatedStyle,
        ]}
      >
        <TouchableOpacity
          onPress={() => onSelect(card)}
          activeOpacity={0.9}
          className={`flex-1 rounded-lg border-2 p-3 ${
            card.type === 'action'
              ? 'bg-green-50 border-green-300'
              : 'bg-blue-50 border-blue-300'
          }`}
        >
          <Text className="font-medium text-sm text-gray-900 mb-1">
            {card.data.name}
          </Text>
          <Text className="text-xs text-gray-600 capitalize">
            {card.type}
          </Text>

          <GestureDetector gesture={leftConnection}>
            <View
              className="absolute left-[-10] w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-md"
              style={{ top: '50%', transform: [{ translateY: -10 }] }}
            />
          </GestureDetector>

          <GestureDetector gesture={rightConnection}>
            <View
              className="absolute right-[-10] w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-md"
              style={{ top: '50%', transform: [{ translateY: -10 }] }}
            />
          </GestureDetector>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
}
