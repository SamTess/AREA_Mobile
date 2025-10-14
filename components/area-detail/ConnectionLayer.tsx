import React, { useMemo } from 'react';
import Svg, { Line } from 'react-native-svg';

import type { ActiveConnection, CardData, Connection } from '@/types/area-detail';
import { CARD_WIDTH, CARD_HEIGHT, screenWidth, screenHeight } from './constants';

const getDockPoint = (card: CardData, side: 'left' | 'right') => {
  const y = card.position.y + CARD_HEIGHT / 2;

  if (side === 'left') {
    if (card.type === 'reaction') {
      return { x: card.position.x, y };
    }

    return { x: card.position.x + CARD_WIDTH / 2, y };
  }

  return { x: card.position.x + CARD_WIDTH, y };
};

interface ConnectionLayerProps {
  cards: CardData[];
  connections: Connection[];
  activeConnection: ActiveConnection | null;
}

export function ConnectionLayer({ cards, connections, activeConnection }: ConnectionLayerProps) {
  const connectorLines = useMemo(
    () =>
      connections
        .map((connection) => {
          const fromCard = cards.find((c) => c.id === connection.from);
          const toCard = cards.find((c) => c.id === connection.to);
          if (!fromCard || !toCard) return null;

          const fromPoint = getDockPoint(fromCard, 'right');
          const toPoint = getDockPoint(toCard, 'left');

          return (
            <Line
              key={`${connection.from}-${connection.to}`}
              x1={fromPoint.x}
              y1={fromPoint.y}
              x2={toPoint.x}
              y2={toPoint.y}
              stroke="#3b82f6"
              strokeWidth={3}
              strokeLinecap="round"
            />
          );
        })
        .filter(Boolean),
    [cards, connections]
  );

  return (
    <Svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: screenWidth * 3,
        height: screenHeight * 3,
      }}
    >
      {connectorLines}

      {activeConnection && (
        <Line
          x1={activeConnection.start.x}
          y1={activeConnection.start.y}
          x2={activeConnection.point.x}
          y2={activeConnection.point.y}
          stroke="#3b82f6"
          strokeWidth={3}
          strokeDasharray="6,6"
          strokeLinecap="round"
        />
      )}
    </Svg>
  );
}
