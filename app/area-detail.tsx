
import React, { useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';

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
  CardDockPosition,
  Connection,
} from '@/types/area-detail';

type ConnectionSide = 'left' | 'right';

const CONNECTION_SNAP_RADIUS = 28;

const getCardConnectionPoints = (card: CardData): Partial<Record<ConnectionSide, CardDockPosition>> => {
  const midpointY = card.position.y + CARD_HEIGHT / 2;

  const points: Partial<Record<ConnectionSide, CardDockPosition>> = {
    right: {
      x: card.position.x + CARD_WIDTH,
      y: midpointY,
    },
  };

  if (card.type === 'reaction') {
    points.left = {
      x: card.position.x,
      y: midpointY,
    };
  }

  return points;
};

const findConnectionTarget = (
  cards: CardData[],
  dropPoint: CardDockPosition
): { cardId: string; side: ConnectionSide } | null => {
  const squareRadius = CONNECTION_SNAP_RADIUS * CONNECTION_SNAP_RADIUS;

  for (const card of cards) {
    const connectionPoints = getCardConnectionPoints(card);

    for (const side of Object.keys(connectionPoints) as ConnectionSide[]) {
      const targetPoint = connectionPoints[side];
      if (!targetPoint) continue;

      const dx = dropPoint.x - targetPoint.x;
      const dy = dropPoint.y - targetPoint.y;
      const distanceSquared = dx * dx + dy * dy;

      if (distanceSquared <= squareRadius) {
        return { cardId: card.id, side };
      }
    }
  }

  return null;
};

export default function AreaDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
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

  const handleStartConnection = (cardId: string, direction: 'left' | 'right', startPoint: CardDockPosition) => {
    console.log('Starting connection from card:', cardId, 'direction:', direction, 'startPoint:', startPoint);
    setActiveConnection({ from: cardId, fromDirection: direction, start: startPoint, point: startPoint });
  };

  const handleUpdateConnection = (translationValue: CardDockPosition | null) => {
    if (!translationValue || !activeConnection) return;
    const point = { x: activeConnection.start.x + translationValue.x, y: activeConnection.start.y + translationValue.y };
    console.log('New connection translation:', translationValue);
    console.log('Updating connection point to:', point);
    if (isRemoveZoneActive) {
      setIsRemoveZoneActive(false);
    }
    setActiveConnection((prev) => (prev ? { ...prev, point: point } : prev));
  };

  const handleEndConnection = (_cardId: string, translationValue: CardDockPosition | null) => {
    if (!activeConnection) {
      setActiveConnection(null);
      setIsRemoveZoneActive(false);
      return;
    }

    const dropPoint = translationValue
      ? {
          x: activeConnection.start.x + translationValue.x,
          y: activeConnection.start.y + translationValue.y,
        }
      : activeConnection.point;

    const target = findConnectionTarget(cards, dropPoint);

    if (target) {
        if (activeConnection.fromDirection === 'right' && target.side === 'left') {
          setConnections((prev) => [...prev, { from: activeConnection.from, to: target.cardId }]);
        } else if (activeConnection.fromDirection === 'left' && target.side === 'right') {
          setConnections((prev) => [...prev, { from: target.cardId, to: activeConnection.from }]);
        }
    }

    setIsRemoveZoneActive(false);
    setActiveConnection(null);
  };

  const handleSelectCard = (card: CardData) => {
    if (activeConnection) return;
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
        name: t('areaDetail.cards.newActionName'),
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
        name: t('areaDetail.cards.newReactionName'),
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
      t('areaDetail.alerts.deleteTitle'),
      t('areaDetail.alerts.deleteMessage'),
      [
        { text: t('areaDetail.alerts.deleteCancel'), style: 'cancel' },
        { text: t('areaDetail.alerts.deleteConfirm'), style: 'destructive' },
      ]
    );
  };

  const handleCardEdit = (cardId: string, updatedCard: CardData) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? updatedCard : c))
    );
  };

  const handleBack = () => {
    router.back();
  };

  if (!area) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-50">
        <Text size="lg" className="text-typography-600">
          {t('areaDetail.notFound')}
        </Text>
      </Box>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <Box className="flex-1 bg-background-50">
          <AreaHeader
            title={areaTitle}
            description={areaDescription}
            isEditing={editingArea}
            onChangeTitle={setAreaTitle}
            onChangeDescription={setAreaDescription}
            onToggleEditing={handleToggleEditing}
            onRequestDelete={handleRequestDelete}
            onBack={handleBack}
          />

          <Box className="flex-1 relative">
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

            <Box className="absolute bottom-6 right-6">
              <AddCardButton
                isRemoveZoneActive={isRemoveZoneActive}
                onAddAction={handleAddAction}
                onAddReaction={handleAddReaction}
                testID="area-add-card-button"
              />
            </Box>

            <RemoveZone isDragging={isDraggingCard} isActive={isRemoveZoneActive} />
          </Box>

          <CardDetailsSheet
            visible={sideMenuVisible}
            card={selectedCard}
            onClose={() => setSideMenuVisible(false)}
            onCardEdit={handleCardEdit}
          />
        </Box>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
