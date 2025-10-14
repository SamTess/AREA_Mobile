import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  Gesture,
  GestureDetector,
  type GestureStateChangeEvent,
  type GestureUpdateEvent,
  type PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import type { CardData, CardDockPosition } from '@/types/area-detail';
import { CARD_WIDTH, CARD_HEIGHT } from './constants';

interface CardProps {
  card: CardData;
  removeZoneTop: number;
  onMove: (id: string, position: CardDockPosition) => void;
  onRemove: (id: string) => void;
  onSelect: (card: CardData) => void;
  onStartConnection: (cardId: string, direction: 'left' | 'right', startPoint: CardDockPosition) => void;
  onUpdateConnection: (point: CardDockPosition | null) => void;
  onEndConnection: (cardId: string, point: CardDockPosition | null) => void;
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
  const isCreatingConnectionRef = useRef(false);

  useEffect(() => {
    translateX.value = card.position.x;
    translateY.value = card.position.y;
  }, [card.position.x, card.position.y, translateX, translateY]);

  const rawCardPan = Gesture.Pan().runOnJS(true);
  const cardPanWithDistance =
    typeof (rawCardPan as any).minDistance === 'function'
      ? (rawCardPan as any).minDistance(10)
      : rawCardPan;

  const cardPan = cardPanWithDistance
    .onBegin(() => {
      if (!isCreatingConnectionRef.current) {
        setIsDragging(true);
      }
    })
    .onUpdate((event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
      if (isCreatingConnectionRef.current) return;

      translateX.value = card.position.x + event.translationX;
      translateY.value = card.position.y + event.translationY;
      const hoveringRemoveZone = event.absoluteY >= removeZoneTop;
      if (hoveringRemoveZone !== isOverRemoveZone.value) {
        isOverRemoveZone.value = hoveringRemoveZone;
        onToggleRemoveZone(hoveringRemoveZone);
      }
    })
    .onEnd((event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
      if (isCreatingConnectionRef.current) {
        setIsDragging(false);
        return;
      }

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
    let startPoint: CardDockPosition | null = null;

    return Gesture.Pan()
      .runOnJS(true)
        .onBegin(() => {
          isCreatingConnectionRef.current = true;
          const offsetX = direction === 'left' ? 0 : CARD_WIDTH;
          startPoint = {
            x: card.position.x + offsetX,
            y: card.position.y + CARD_HEIGHT / 2,
          };
          onStartConnection(card.id, direction, startPoint!);
        })
      .onChange((event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
        const updatePoint: CardDockPosition = {
          x: event.absoluteX,
          y: event.absoluteY,
        };
        // console.log('Updating connection to', updatePoint);
        onUpdateConnection(updatePoint);
      })
      .onEnd((event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
        const finalPoint: CardDockPosition = {
          x: event.absoluteX,
          y: event.absoluteY,
        };
        // console.log('Final connection point', finalPoint);
        onEndConnection(card.id, finalPoint);
      })
        .onFinalize(() => {
          isCreatingConnectionRef.current = false;
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
