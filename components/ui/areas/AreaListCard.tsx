import React from 'react';
import { Pressable } from 'react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Zap, CheckCircle, XCircle, Clock, Circle } from 'lucide-react-native';
import type { Area, AreaDto } from '@/types/areas';

export interface AreaListCardProps {
  area: Area | AreaDto;
  onPress?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'success':
      return '#10B981';
    case 'failed':
      return '#EF4444';
    case 'in progress':
      return '#F59E0B';
    case 'not started':
      return '#6B7280';
    default:
      return '#6B7280';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success':
      return CheckCircle;
    case 'failed':
      return XCircle;
    case 'in progress':
      return Clock;
    case 'not started':
      return Circle;
    default:
      return Circle;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'success':
      return 'Success';
    case 'failed':
      return 'Failed';
    case 'in progress':
      return 'In Progress';
    case 'not started':
      return 'Not Started';
    default:
      return status;
  }
};

export const AreaListCard: React.FC<AreaListCardProps> = ({ area, onPress }) => {
  // Handle both Area and AreaDto types
  const isAreaDto = 'actions' in area && 'reactions' in area;
  const services = isAreaDto ? [] : (area as Area).services || [];
  const status = isAreaDto ? 'not started' : (area as Area).status || 'not started';
  const lastRun = isAreaDto ? area.updatedAt : (area as Area).lastRun;

  const StatusIcon = getStatusIcon(status);
  const statusColor = getStatusColor(status);
  const actionsCount = isAreaDto ? (area as AreaDto).actions.length : 0;
  const reactionsCount = isAreaDto ? (area as AreaDto).reactions.length : 0;

  return (
    <Pressable onPress={onPress}>
      <Box className="bg-background-50 rounded-xl p-4 mb-3 border border-outline-100">
        <VStack space="md">
          {/* Header with title and status */}
          <HStack className="items-center justify-between">
            <HStack className="items-center flex-1" space="sm">
              <Box className="bg-primary-500 rounded-lg p-2">
                <Icon as={Zap} size="sm" className="text-white" />
              </Box>
              <Text className="text-typography-900 font-semibold text-lg flex-1" numberOfLines={1}>
                {area.name}
              </Text>
            </HStack>
            <Badge
              size="sm"
              variant="solid"
              action="muted"
              className="ml-2"
              style={{ backgroundColor: statusColor }}
            >
              <HStack space="xs" className="items-center">
                <Icon as={StatusIcon} size="xs" className="text-white" />
                <BadgeText className="text-white text-xs">{getStatusText(status)}</BadgeText>
              </HStack>
            </Badge>
          </HStack>

          {/* Description */}
          {area.description && (
            <Text className="text-typography-700 text-sm" numberOfLines={2}>
              {area.description}
            </Text>
          )}

          {/* Actions and Reactions count for AreaDto */}
          {isAreaDto && (
            <HStack space="md">
              <Badge size="sm" variant="outline" action="info">
                <BadgeText className="text-xs">
                  {actionsCount} {actionsCount === 1 ? 'Action' : 'Actions'}
                </BadgeText>
              </Badge>
              <Badge size="sm" variant="outline" action="success">
                <BadgeText className="text-xs">
                  {reactionsCount} {reactionsCount === 1 ? 'Reaction' : 'Reactions'}
                </BadgeText>
              </Badge>
            </HStack>
          )}

          {/* Services badges for Area type */}
          {!isAreaDto && services.length > 0 && (
            <HStack space="xs" className="flex-wrap">
              {services.slice(0, 3).map((service, index) => (
                <Badge key={index} size="sm" variant="outline" action="info">
                  <BadgeText className="text-xs">{service}</BadgeText>
                </Badge>
              ))}
              {services.length > 3 && (
                <Badge size="sm" variant="outline" action="muted">
                  <BadgeText className="text-xs">+{services.length - 3}</BadgeText>
                </Badge>
              )}
            </HStack>
          )}

          {/* Footer with enabled status and last run */}
          <HStack className="items-center justify-between">
            <HStack space="xs" className="items-center">
              <Box
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: area.enabled ? '#10B981' : '#6B7280' }}
              />
              <Text className="text-typography-600 text-xs">
                {area.enabled ? 'Enabled' : 'Disabled'}
              </Text>
            </HStack>
            {lastRun && (
              <Text className="text-typography-500 text-xs">
                {new Date(lastRun).toLocaleDateString()}
              </Text>
            )}
          </HStack>
        </VStack>
      </Box>
    </Pressable>
  );
};
