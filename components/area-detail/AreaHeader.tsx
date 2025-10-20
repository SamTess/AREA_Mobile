import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Edit3, Trash2, ArrowLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

interface AreaHeaderProps {
  title: string;
  description: string;
  isEditing: boolean;
  onChangeTitle: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onToggleEditing: () => void;
  onRequestDelete: () => void;
  onBack?: () => void;
}

export function AreaHeader({
  title,
  description,
  isEditing,
  onChangeTitle,
  onChangeDescription,
  onToggleEditing,
  onRequestDelete,
  onBack,
}: AreaHeaderProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const containerStyle = React.useMemo(
    () => ({
      paddingTop: insets.top + 5,
      marginTop: -insets.top,
      zIndex: 40,
      elevation: 40,
    }),
    [insets.top]
  );

  return (
    <Box
      className="bg-surface px-4 pb-4 border-b border-outline-200 shadow-sm"
      style={containerStyle}
    >
      <View className="flex-row items-center justify-between">
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            className="p-2 mr-2"
            testID="back-button"
          >
            <Icon as={ArrowLeft} size="xl" className="text-typography-900" />
          </TouchableOpacity>
        )}

        <View className="flex-1">
          {isEditing ? (
            <View>
              <TextInput
                value={title}
                onChangeText={onChangeTitle}
                className="text-xl font-bold text-typography-900 border-b border-outline-200 pb-1 mb-2"
                placeholder={t('areaDetail.header.titlePlaceholder')}
              />
              <TextInput
                value={description}
                onChangeText={onChangeDescription}
                className="text-sm text-typography-600 border-b border-outline-200 pb-1"
                placeholder={t('areaDetail.header.descriptionPlaceholder')}
                multiline
              />
            </View>
          ) : (
            <View>
              <Text className="text-xl font-bold text-typography-900">{title}</Text>
            </View>
          )}
        </View>

        <View className="flex-row gap-2 ml-4">
          <TouchableOpacity
            onPress={onToggleEditing}
            className="p-2 bg-primary-500 rounded-full"
            testID="toggle-edit"
          >
            <Edit3 size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onRequestDelete}
            className="p-2 bg-error-500 rounded-full"
            testID="request-delete"
          >
            <Trash2 size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Box>
  );
}
