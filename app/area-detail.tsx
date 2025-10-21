
import React, { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';
import { useSelectedArea } from '@/contexts/SelectedAreaContext';

import {
  AddCardButton,
  AreaHeader,
  Card,
  CardDetailsSheet,
  ConnectionLayer,
  DotGridBackground,
  LinkDetailsSheet,
  RemoveZone,
  CARD_HEIGHT,
  CARD_WIDTH,
  REMOVE_ZONE_HEIGHT,
  screenHeight,
} from '@/components/area-detail';
import type { ActionDto, ReactionDto } from '@/types/areas';
import type {
  ActiveConnection,
  CardData,
  CardDockPosition,
  Connection,
} from '@/types/area-detail';

type ConnectionSide = 'left' | 'right';

const CONNECTION_SNAP_RADIUS = 28;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;

const clamp = (value: number, lower: number, upper: number) => {
  'worklet';
  return Math.min(Math.max(value, lower), upper);
};

const toCanvasCoords = (translation: CardDockPosition, scale: number): CardDockPosition => {
  const safeScale = scale || 1;
  return {
    x: translation.x / safeScale,
    y: translation.y / safeScale,
  };
};

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

  const {
    selectedArea,
    cards,
    connections,
    isLoading,
    error,
    loadArea,
    updateAreaDetails,
    addAction,
    addReaction,
    updateCard,
    removeCard,
    addConnection,
    removeConnection,
    updateConnection,
    clearError,
  } = useSelectedArea();

  const [isDraggingCard, setIsDraggingCard] = useState(false);
  const [activeConnection, setActiveConnection] = useState<ActiveConnection | null>(null);
  const [isRemoveZoneActive, setIsRemoveZoneActive] = useState(false);
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [editingArea, setEditingArea] = useState(false);
  const [areaTitle, setAreaTitle] = useState('');
  const [areaDescription, setAreaDescription] = useState('');
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [linkModalVisible, setLinkModalVisible] = useState(false);

  const canvasTranslateX = useSharedValue(0);
  const canvasTranslateY = useSharedValue(0);
  const canvasScale = useSharedValue(1);
  const pinchStartScale = useSharedValue(1);
  const canvasOffsetRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const isDraggingConnection = activeConnection !== null;

  const removeZoneTop = screenHeight - REMOVE_ZONE_HEIGHT;

  useEffect(() => {
    if (areaId) {
      loadArea(areaId);
    }
  }, [areaId, loadArea]);

  useEffect(() => {
    if (selectedArea) {
      setAreaTitle(selectedArea.name);
      setAreaDescription(selectedArea.description);
    }
  }, [selectedArea]);

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

  const canvasPinch = Gesture.Pinch()
    .onBegin(() => {
      pinchStartScale.value = canvasScale.value;
    })
    .onUpdate((event) => {
      const nextScale = clamp(pinchStartScale.value * event.scale, MIN_ZOOM, MAX_ZOOM);
      canvasScale.value = nextScale;
    });

  const canvasGesture = Gesture.Simultaneous(canvasPan, canvasPinch);

  const canvasAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: canvasTranslateX.value },
      { translateY: canvasTranslateY.value },
      { scale: canvasScale.value },
    ],
  }));

  const handleStartConnection = (cardId: string, direction: 'left' | 'right', startPoint: CardDockPosition) => {
    setActiveConnection({ from: cardId, fromDirection: direction, start: startPoint, point: startPoint });
  };

  const handleUpdateConnection = (translationValue: CardDockPosition | null) => {
    if (!translationValue || !activeConnection) return;
    const scaledTranslation = toCanvasCoords(translationValue, canvasScale.value);
    const point = {
      x: activeConnection.start.x + scaledTranslation.x,
      y: activeConnection.start.y + scaledTranslation.y,
    };
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

    const scaledTranslation = translationValue
      ? toCanvasCoords(translationValue, canvasScale.value)
      : null;

    const dropPoint = scaledTranslation
      ? {
          x: activeConnection.start.x + scaledTranslation.x,
          y: activeConnection.start.y + scaledTranslation.y,
        }
      : activeConnection.point;

    const target = findConnectionTarget(cards, dropPoint);

    if (target) {
        if (activeConnection.fromDirection === 'right' && target.side === 'left') {
          addConnection({ from: activeConnection.from, to: target.cardId });
        } else if (activeConnection.fromDirection === 'left' && target.side === 'right') {
          addConnection({ from: target.cardId, to: activeConnection.from });
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

  const handleSelectConnection = (connection: Connection) => {
    setSelectedConnection(connection);
    setLinkModalVisible(true);
  };

  const handleAddAction = () => {
    addAction({
      actionDefinitionId: '',
      name: t('areaDetail.cards.newActionName'),
      parameters: {},
      activationConfig: { type: 'manual' },
    });
  };

  const handleAddReaction = () => {
    addReaction({
      actionDefinitionId: '',
      name: t('areaDetail.cards.newReactionName'),
      parameters: {},
      order: cards.filter((c) => c.type === 'reaction').length,
      continue_on_error: false,
    });
  };

  const handleToggleEditing = () => {
    setEditingArea((prev) => !prev);
  };

  const handleAreaTitleChange = (title: string) => {
    setAreaTitle(title);
    updateAreaDetails(title, areaDescription);
  };

  const handleAreaDescriptionChange = (description: string) => {
    setAreaDescription(description);
    updateAreaDetails(areaTitle, description);
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
    updateCard(cardId, updatedCard);
  };

  const handleConnectionSave = (updatedConnection: Connection) => {
    updateConnection(selectedConnection!, updatedConnection);
  };

  const handleConnectionRemove = (connection: Connection) => {
    removeConnection(connection);
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-0 items-center justify-center">
        <Text size="lg" className="text-typography-600">
          {t('areaDetail.loading', 'Loading area...')}
        </Text>
      </SafeAreaView>
    );
  }

  if (!selectedArea) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-50">
        <Text size="lg" className="text-typography-600">
          {t('areaDetail.notFound', 'Area not found')}
        </Text>
      </Box>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Box className="flex-1 bg-surface top-0">
          <AreaHeader
            title={areaTitle}
            description={areaDescription}
            isEditing={editingArea}
            onChangeTitle={handleAreaTitleChange}
            onChangeDescription={handleAreaDescriptionChange}
            onToggleEditing={handleToggleEditing}
            onRequestDelete={handleRequestDelete}
            onBack={handleBack}
          />

          <Box className="flex-1 relative">
            <GestureDetector gesture={canvasGesture}>
              <Animated.View style={[{ flex: 1 }, canvasAnimatedStyle]}>
                <DotGridBackground />
                <ConnectionLayer
                  cards={cards}
                  connections={connections}
                  activeConnection={activeConnection}
                  onConnectionPress={handleSelectConnection}
                />

                {cards.map((card) => (
                  <Card
                    key={card.id}
                    card={card}
                    removeZoneTop={removeZoneTop}
                    onMove={(id, position) => {
                      updateCard(id, { position });
                    }}
                    onRemove={(id) => {
                      removeCard(id);
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

          <LinkDetailsSheet
            visible={linkModalVisible}
            connection={selectedConnection}
            onClose={() => setLinkModalVisible(false)}
            onSave={handleConnectionSave}
            onRemove={handleConnectionRemove}
          />
        </Box>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
