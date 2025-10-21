
export interface Area {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  lastRun: string;
  services: string[];
  status: 'success' | 'failed' | 'in progress' | 'not started';
}


export interface AreaDto {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  userId: string;
  userEmail: string;
  actions: ActionDto[];
  reactions: ReactionDto[];
  createdAt: string;
  updatedAt: string;
}


export interface AreaList {
  areas: (Area | AreaDto)[];
  services: Service[];
  onDelete?: (id: string | number) => void;
  onRun?: (id: string | number) => void;
  onToggleActivation?: (id: number, enabled: boolean) => void;
}


export interface Service {
  id: string;
  name: string;
  logo: string;
}


export interface Condition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'contains_any' | 'not_empty' | 'greater_than' | 'less_than';
  value: unknown;
}


export interface ConditionGroup {
  operator: 'and' | 'or';
  conditions: (Condition | ConditionGroup)[];
}


export interface ActivationConfig {
  type: 'webhook' | 'cron' | 'manual' | 'poll' | 'chain';
  webhook_url?: string;
  events?: string[];
  cron_expression?: string;
  poll_interval?: number;
  secret_token?: string;
}


export interface ActionDto {
  id: string;
  actionDefinitionId: string;
  name: string;
  parameters: Record<string, unknown>;
  activationConfig: ActivationConfig;
}


export interface ReactionDto {
  id: string;
  actionDefinitionId: string;
  name: string;
  parameters: Record<string, unknown>;
  mapping?: Record<string, string>;
  condition?: ConditionGroup;
  order: number;
  continue_on_error: boolean;
  activationConfig?: ActivationConfig;
}
