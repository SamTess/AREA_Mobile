import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';

import type { CardData } from '@/types/area-detail';

interface CardDetailsSheetProps {
  visible: boolean;
  card: CardData | null;
  onClose: () => void;
}

export function CardDetailsSheet({ visible, card, onClose }: CardDetailsSheetProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <Text className="text-lg font-bold">Card Details</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View className="p-4">
          {card && (
            <View>
              <Text className="text-base font-medium mb-2">
                Type: {card.type.charAt(0).toUpperCase() + card.type.slice(1)}
              </Text>
              <Text className="text-base font-medium mb-2">
                Name: {card.data.name}
              </Text>
              <Text className="text-sm text-gray-600">ID: {card.data.id}</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
