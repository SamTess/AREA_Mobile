import React, { useState, useEffect } from 'react';
import { Modal, View, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import type { Connection } from '@/types/area-detail';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';

interface LinkDetailsSheetProps {
  visible: boolean;
  connection: Connection | null;
  onClose: () => void;
  onSave: (connection: Connection) => void;
  onRemove: (connection: Connection) => void;
}

export function LinkDetailsSheet({ visible, connection, onClose, onSave, onRemove }: LinkDetailsSheetProps) {
  const { t } = useTranslation();
  const [order, setOrder] = useState('');

  useEffect(() => {
    if (connection) {
      setOrder(connection.order?.toString() || '1');
    }
  }, [connection]);

  const handleSave = () => {
    if (!connection) return;
    const updatedConnection: Connection = {
      ...connection,
      order: parseInt(order) || 1,
    };
    onSave(updatedConnection);
    onClose();
  };

  const handleRemove = () => {
    if (!connection) return;
    onRemove(connection);
    onClose();
  };

  if (!connection) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-background-0">
        <View className="flex-row items-center justify-between p-4 border-b border-outline-200">
          <Heading size="md" className="text-typography-900">
            {t('areaDetail.linkDetails.title')}
          </Heading>
          <TouchableOpacity onPress={onClose} className="p-2">
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View className="flex-1 p-4">
          <VStack space="md">
            <View>
              <Text className="text-typography-700 mb-2">
                {t('areaDetail.linkDetails.orderLabel')}
              </Text>
              <Input className="w-full">
                <InputField
                  value={order}
                  onChangeText={setOrder}
                  keyboardType="numeric"
                  placeholder="1"
                />
              </Input>
            </View>

            <HStack space="md" className="mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onPress={handleRemove}
              >
                <ButtonText className="text-error-600">
                  {t('areaDetail.linkDetails.remove')}
                </ButtonText>
              </Button>
              <Button
                className="flex-1"
                onPress={handleSave}
              >
                <ButtonText>
                  {t('areaDetail.linkDetails.save')}
                </ButtonText>
              </Button>
            </HStack>
          </VStack>
        </View>
      </View>
    </Modal>
  );
}