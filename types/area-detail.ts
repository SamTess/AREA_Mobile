import type { ActionDto, ReactionDto } from './areas';

export interface CardPosition {
  x: number;
  y: number;
}

export type CardType = 'action' | 'reaction';

export interface CardData {
  id: string;
  type: CardType;
  data: ActionDto | ReactionDto;
  position: CardPosition;
}

export interface Connection {
  from: string;
  to: string;
}

export interface ActiveConnection {
  from: string;
  start: CardPosition;
  point: CardPosition;
}
