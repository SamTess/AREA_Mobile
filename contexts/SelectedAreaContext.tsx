import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { InteractionManager } from 'react-native';
import { router } from 'expo-router';
import type { AreaDto, ActionDto, ReactionDto } from '@/types/areas';
import type { CardData, Connection } from '@/types/area-detail';
import * as areaService from '@/services/area';
import { useAuth } from './AuthContext';

interface SelectedAreaContextValue {
  selectedArea: AreaDto | null;
  cards: CardData[];
  connections: Connection[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  loadArea: (areaId: string) => Promise<void>;
  saveArea: () => Promise<void>;
  updateAreaDetails: (name: string, description: string) => void;
  addAction: (action: Omit<ActionDto, 'id'>) => void;
  addReaction: (reaction: Omit<ReactionDto, 'id'>) => void;
  updateCard: (cardId: string, updates: Partial<CardData>) => void;
  removeCard: (cardId: string) => void;
  addConnection: (connection: Connection) => void;
  removeConnection: (connection: Connection) => void;
  updateConnection: (oldConnection: Connection, newConnection: Connection) => void;
  clearError: () => void;
}

const SelectedAreaContext = createContext<SelectedAreaContextValue | undefined>(undefined);

interface SelectedAreaProviderProps {
  children: ReactNode;
}

export function SelectedAreaProvider({ children }: SelectedAreaProviderProps) {
  const { isAuthenticated } = useAuth();
  const [selectedArea, setSelectedArea] = useState<AreaDto | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: unknown) => {
    const message = err instanceof Error ? err.message : 'Something went wrong';
    setError(message);
    console.error('SelectedAreaContext error:', err);
  }, []);

  const convertAreaToCards = useCallback((area: AreaDto): CardData[] => {
    const actionCards: CardData[] = area.actions.map((action, index) => ({
      id: action.id,
      type: 'action' as const,
      data: action,
      position: { x: 100, y: 150 + index * 200 },
    }));

    const reactionCards: CardData[] = area.reactions.map((reaction, index) => ({
      id: reaction.id,
      type: 'reaction' as const,
      data: reaction,
      position: { x: 400, y: 150 + index * 200 },
    }));

    return [...actionCards, ...reactionCards];
  }, []);

  const convertCardsToArea = useCallback((area: AreaDto, cards: CardData[]): AreaDto => {
    const actions: ActionDto[] = cards
      .filter(card => card.type === 'action')
      .map(card => card.data as ActionDto);

    const reactions: ReactionDto[] = cards
      .filter(card => card.type === 'reaction')
      .map(card => card.data as ReactionDto);

    return {
      ...area,
      actions,
      reactions,
    };
  }, []);

  const loadArea = useCallback(async (areaId: string) => {

    setIsLoading(true);
    setError(null);

    try {
      const area = await areaService.getArea(areaId);
      if (area) {
        setSelectedArea(area);
        const areaCards = convertAreaToCards(area);
        setCards(areaCards);
        // TODO: Load connections from area data if stored
        setConnections([]);
      } else {
        throw new Error('Area not found');
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [convertAreaToCards, handleError]);

  const saveArea = useCallback(async () => {
    if (!selectedArea) return;

    setIsSaving(true);
    setError(null);

    try {
      const updatedArea = convertCardsToArea(selectedArea, cards);
      const savedArea = await areaService.updateArea(selectedArea.id, {
        name: updatedArea.name,
        description: updatedArea.description,
        actions: updatedArea.actions,
        reactions: updatedArea.reactions,
      });
      setSelectedArea(savedArea);
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [selectedArea, cards, convertCardsToArea, handleError]);

  const updateAreaDetails = useCallback((name: string, description: string) => {
    if (!selectedArea) return;
    setSelectedArea(prev => prev ? { ...prev, name, description } : null);
  }, [selectedArea]);

  const addAction = useCallback((actionData: Omit<ActionDto, 'id'>) => {
    const newId = `action_${Date.now()}`;
    const newAction: ActionDto = {
      ...actionData,
      id: newId,
    };
    const newCard: CardData = {
      id: newId,
      type: 'action',
      data: newAction,
      position: { x: 100, y: cards.filter(c => c.type === 'action').length * 200 + 150 },
    };
    setCards(prev => [...prev, newCard]);
  }, [cards]);

  const addReaction = useCallback((reactionData: Omit<ReactionDto, 'id'>) => {
    const newId = `reaction_${Date.now()}`;
    const newReaction: ReactionDto = {
      ...reactionData,
      id: newId,
    };
    const newCard: CardData = {
      id: newId,
      type: 'reaction',
      data: newReaction,
      position: { x: 400, y: cards.filter(c => c.type === 'reaction').length * 200 + 150 },
    };
    setCards(prev => [...prev, newCard]);
  }, [cards]);

  const updateCard = useCallback((cardId: string, updates: Partial<CardData>) => {
    setCards(prev => prev.map(card =>
      card.id === cardId ? { ...card, ...updates } : card
    ));
  }, []);

  const removeCard = useCallback((cardId: string) => {
    setCards(prev => prev.filter(card => card.id !== cardId));
    setConnections(prev => prev.filter(conn => conn.from !== cardId && conn.to !== cardId));
  }, []);

  const addConnection = useCallback((connection: Connection) => {
    setConnections(prev => [...prev, connection]);
  }, []);

  const removeConnection = useCallback((connection: Connection) => {
    setConnections(prev => prev.filter(conn =>
      !(conn.from === connection.from && conn.to === connection.to)
    ));
  }, []);

  const updateConnection = useCallback((oldConnection: Connection, newConnection: Connection) => {
    setConnections(prev => prev.map(conn =>
      (conn.from === oldConnection.from && conn.to === oldConnection.to)
        ? newConnection
        : conn
    ));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<SelectedAreaContextValue>(() => ({
    selectedArea,
    cards,
    connections,
    isLoading,
    isSaving,
    error,
    loadArea,
    saveArea,
    updateAreaDetails,
    addAction,
    addReaction,
    updateCard,
    removeCard,
    addConnection,
    removeConnection,
    updateConnection,
    clearError,
  }), [
    selectedArea,
    cards,
    connections,
    isLoading,
    isSaving,
    error,
    loadArea,
    saveArea,
    updateAreaDetails,
    addAction,
    addReaction,
    updateCard,
    removeCard,
    addConnection,
    removeConnection,
    updateConnection,
    clearError,
  ]);

  return (
    <SelectedAreaContext.Provider value={value}>
      {children}
    </SelectedAreaContext.Provider>
  );
}

export function useSelectedArea() {
  const context = useContext(SelectedAreaContext);
  if (!context) {
    throw new Error('useSelectedArea must be used within a SelectedAreaProvider');
  }
  return context;
}