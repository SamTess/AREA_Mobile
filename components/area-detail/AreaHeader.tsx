import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Edit3, Trash2, ArrowLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';

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

  return (
    <Box
      className="bg-surface p-4 border-b border-outline-200 shadow-sm"
      style={{ zIndex: 40, elevation: 40 }}
    >
      <View className="flex-row items-center justify-between">
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            className="p-2 mr-2"
            testID="back-button"
          >
            <ArrowLeft size={24} color="#1f2937" />
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
              <Text className="text-sm text-typography-600 mt-1">{description}</Text>
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
