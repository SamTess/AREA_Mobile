
import React, { useRef, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import {
  AddCardButton,
  AreaHeader,
  Card,
  CardDetailsSheet,
  ConnectionLayer,
  DotGridBackground,
  RemoveZone,
  CARD_HEIGHT,
  CARD_WIDTH,
  REMOVE_ZONE_HEIGHT,
  screenHeight,
} from '@/components/area-detail';
import areasData from '@/mocks/areas.json';
import type { AreaDto, ActionDto, ReactionDto } from '@/types/areas';
import type {
  ActiveConnection,
  CardData,
  CardPosition,
  Connection,
} from '@/types/area-detail';

export default function AreaDetailScreen() {
  const params = useLocalSearchParams();
  const areaId = params.id as string;

  const area = areasData.areas.find((a) => a.id === areaId) as AreaDto | undefined;

  const [cards, setCards] = useState<CardData[]>(() => {
    if (!area) return [];

    const actionCards: CardData[] = area.actions.map((action, index) => ({
      id: action.id,
      type: 'action',
      data: action,
      position: { x: 100, y: 150 + index * 200 },
    }));

    const reactionCards: CardData[] = area.reactions.map((reaction, index) => ({
      id: reaction.id,
      type: 'reaction',
      data: reaction,
      position: { x: 400, y: 150 + index * 200 },
    }));

    return [...actionCards, ...reactionCards];
  });

  const [connections, setConnections] = useState<Connection[]>([]);
  const [isDraggingCard, setIsDraggingCard] = useState(false);
  const [activeConnection, setActiveConnection] = useState<ActiveConnection | null>(null);
  const [isRemoveZoneActive, setIsRemoveZoneActive] = useState(false);
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [editingArea, setEditingArea] = useState(false);
  const [areaTitle, setAreaTitle] = useState(area?.name || '');
  const [areaDescription, setAreaDescription] = useState(area?.description || '');

  const canvasTranslateX = useSharedValue(0);
  const canvasTranslateY = useSharedValue(0);
  const canvasOffsetRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const isDraggingConnection = activeConnection !== null;

  const removeZoneTop = screenHeight - REMOVE_ZONE_HEIGHT;

  const canvasPan = Gesture.Pan()
    .runOnJS(true)
    .onBegin(() => {
      panStartRef.current = { ...canvasOffsetRef.current };
    })
    .onChange((event) => {
      if (isDraggingCard || isDraggingConnection) {
        canvasTranslateX.value = panStartRef.current.x;
        canvasTranslateY.value = panStartRef.current.y;
        return;
      }
      const nextX = panStartRef.current.x + event.translationX;
      const nextY = panStartRef.current.y + event.translationY;
      canvasTranslateX.value = nextX;
      canvasTranslateY.value = nextY;
    })
    .onEnd((event) => {
      if (isDraggingCard || isDraggingConnection) {
        canvasTranslateX.value = panStartRef.current.x;
        canvasTranslateY.value = panStartRef.current.y;
        return;
      }
      canvasOffsetRef.current = {
        x: panStartRef.current.x + event.translationX,
        y: panStartRef.current.y + event.translationY,
      };
    });

  const canvasAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: canvasTranslateX.value },
      { translateY: canvasTranslateY.value },
    ],
  }));

  const handleStartConnection = (cardId: string, startPoint: CardPosition) => {
    setActiveConnection({ from: cardId, start: startPoint, point: startPoint });
  };

  const handleUpdateConnection = (point: CardPosition | null) => {
    if (point === null) {
      setActiveConnection((prev) => (prev ? { ...prev, point: prev.start } : null));
      return;
    }

    setActiveConnection((prev) => (prev ? { ...prev, point } : prev));
  };

  const handleEndConnection = (_cardId: string, point: CardPosition | null) => {
    setActiveConnection((prev) => {
      if (!prev) return null;

      const finalPoint = point ?? prev.point;
      const target = cards.find((c) =>
        finalPoint.x >= c.position.x &&
        finalPoint.x <= c.position.x + CARD_WIDTH &&
        finalPoint.y >= c.position.y &&
        finalPoint.y <= c.position.y + CARD_HEIGHT
      );

      if (target && target.id !== prev.from) {
        setConnections((existing) => {
          const alreadyLinked = existing.some(
            (conn) => conn.from === prev.from && conn.to === target.id
          );
          if (alreadyLinked) return existing;
          return [...existing, { from: prev.from, to: target.id }];
        });
      }

      return null;
    });
  };

  const handleSelectCard = (card: CardData) => {
    setSelectedCard(card);
    setSideMenuVisible(true);
  };

  const handleAddAction = () => {
    const newId = `action_${Date.now()}`;
    const newCard: CardData = {
      id: newId,
      type: 'action',
      data: {
        id: newId,
        actionDefinitionId: '',
        name: 'New Action',
        parameters: {},
        activationConfig: { type: 'manual' },
      } as ActionDto,
      position: { x: 100, y: 100 },
    };

    setCards((prev) => [...prev, newCard]);
  };

  const handleAddReaction = () => {
    const newId = `reaction_${Date.now()}`;
    const newCard: CardData = {
      id: newId,
      type: 'reaction',
      data: {
        id: newId,
        actionDefinitionId: '',
        name: 'New Reaction',
        parameters: {},
        order: cards.filter((c) => c.type === 'reaction').length,
        continue_on_error: false,
      } as ReactionDto,
      position: { x: 400, y: 100 },
    };

    setCards((prev) => [...prev, newCard]);
  };

  const handleToggleEditing = () => {
    setEditingArea((prev) => !prev);
  };

  const handleRequestDelete = () => {
    Alert.alert(
      'Delete Area',
      'Are you sure you want to delete this area?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive' },
      ]
    );
  };

  if (!area) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-gray-600">Area not found</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View className="flex-1 bg-gray-50">
          <AreaHeader
            title={areaTitle}
            description={areaDescription}
            isEditing={editingArea}
            onChangeTitle={setAreaTitle}
            onChangeDescription={setAreaDescription}
            onToggleEditing={handleToggleEditing}
            onRequestDelete={handleRequestDelete}
          />

          <View className="flex-1 relative">
            <GestureDetector gesture={canvasPan}>
              <Animated.View style={[{ flex: 1 }, canvasAnimatedStyle]}>
                <DotGridBackground />
                <ConnectionLayer
                  cards={cards}
                  connections={connections}
                  activeConnection={activeConnection}
                />

                {cards.map((card) => (
                  <Card
                    key={card.id}
                    card={card}
                    removeZoneTop={removeZoneTop}
                    onMove={(id, position) => {
                      setCards((prev) =>
                        prev.map((c) => (c.id === id ? { ...c, position } : c))
                      );
                    }}
                    onRemove={(id) => {
                      setCards((prev) => prev.filter((c) => c.id !== id));
                      setConnections((prev) =>
                        prev.filter((conn) => conn.from !== id && conn.to !== id)
                      );
                    }}
                    onSelect={handleSelectCard}
                    onStartConnection={handleStartConnection}
                    onUpdateConnection={handleUpdateConnection}
                    onEndConnection={handleEndConnection}
                    setIsDragging={setIsDraggingCard}
                    onToggleRemoveZone={setIsRemoveZoneActive}
                  />
                ))}
              </Animated.View>
            </GestureDetector>

            <View className="absolute bottom-6 right-6">
              <AddCardButton
                isRemoveZoneActive={isRemoveZoneActive}
                onAddAction={handleAddAction}
                onAddReaction={handleAddReaction}
              />
            </View>

            <RemoveZone isDragging={isDraggingCard} isActive={isRemoveZoneActive} />
          </View>

          <CardDetailsSheet
            visible={sideMenuVisible}
            card={selectedCard}
            onClose={() => setSideMenuVisible(false)}
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
