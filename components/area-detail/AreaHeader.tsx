import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Edit3, Trash2 } from 'lucide-react-native';

interface AreaHeaderProps {
  title: string;
  description: string;
  isEditing: boolean;
  onChangeTitle: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onToggleEditing: () => void;
  onRequestDelete: () => void;
}

export function AreaHeader({
  title,
  description,
  isEditing,
  onChangeTitle,
  onChangeDescription,
  onToggleEditing,
  onRequestDelete,
}: AreaHeaderProps) {
  return (
    <View
      className="bg-white p-4 border-b border-gray-200 shadow-sm"
      style={{ zIndex: 40, elevation: 40 }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          {isEditing ? (
            <View>
              <TextInput
                value={title}
                onChangeText={onChangeTitle}
                className="text-xl font-bold text-gray-900 border-b border-gray-300 pb-1 mb-2"
                placeholder="Area title"
              />
              <TextInput
                value={description}
                onChangeText={onChangeDescription}
                className="text-sm text-gray-600 border-b border-gray-300 pb-1"
                placeholder="Area description"
                multiline
              />
            </View>
          ) : (
            <View>
              <Text className="text-xl font-bold text-gray-900">{title}</Text>
              <Text className="text-sm text-gray-600 mt-1">{description}</Text>
            </View>
          )}
        </View>

        <View className="flex-row gap-2 ml-4">
          <TouchableOpacity
            onPress={onToggleEditing}
            className="p-2 bg-blue-500 rounded-full"
            testID="toggle-edit"
          >
            <Edit3 size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onRequestDelete}
            className="p-2 bg-red-500 rounded-full"
            testID="request-delete"
          >
            <Trash2 size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
