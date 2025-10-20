import React, { useState, useEffect } from 'react';
import { Modal, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import type { CardData, ActionDto, ReactionDto } from '@/types/area-detail';
import type { Service } from '@/types/services';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';

interface CardDetailsSheetProps {
  visible: boolean;
  card: CardData | null;
  onClose: () => void;
  onCardEdit?: (cardId: string, updatedCard: CardData) => void;
}

type TriggerType = 'cron' | 'webhook' | 'manual';

export function CardDetailsSheet({ visible, card, onClose, onCardEdit }: CardDetailsSheetProps) {
  const { t } = useTranslation();
  const [editedCard, setEditedCard] = useState<CardData | null>(null);
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState<TriggerType>('manual');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [cronExpression, setCronExpression] = useState('');

  useEffect(() => {
    const loadServices = async () => {
      try {
        const servicesData = require('@/mocks/services.json') as Service[];
        setServices(servicesData.filter(s => s.isActive));
      } catch (error) {
        console.error('Failed to load services:', error);
      }
    };
    loadServices();
  }, []);

  useEffect(() => {
    if (card) {
      setEditedCard(card);
      setName(card.data.name);

      if (card.type === 'action') {
        const actionData = card.data as ActionDto;
        const activationType = actionData.activationConfig?.type || 'manual';
        setTriggerType(activationType as TriggerType);
        setWebhookUrl(actionData.activationConfig?.webhook_url || '');
        setCronExpression(actionData.activationConfig?.cron_expression || '');
      }
    }
  }, [card]);

  const handleSave = () => {
    if (!editedCard) return;

    const updatedCard: CardData = {
      ...editedCard,
      data: {
        ...editedCard.data,
        name,
      },
    };

    if (editedCard.type === 'action') {
      const actionData = updatedCard.data as ActionDto;
      actionData.activationConfig = {
        type: triggerType,
        ...(triggerType === 'webhook' && {
          webhook_url: webhookUrl,
          secret_token: '',
        }),
        ...(triggerType === 'cron' && {
          cron_expression: cronExpression
        }),
      };

      if (triggerType === 'webhook' && selectedService) {
        actionData.parameters = {
          ...actionData.parameters,
          serviceId: selectedService.id,
          serviceName: selectedService.name,
        };
      }
    } else if (editedCard.type === 'reaction') {
      const reactionData = updatedCard.data as ReactionDto;
      if (selectedService) {
        reactionData.parameters = {
          ...reactionData.parameters,
          serviceId: selectedService.id,
          serviceName: selectedService.name,
        };
      }
    }

    onCardEdit?.(editedCard.id, updatedCard);
    onClose();
  };

  const renderActionSettings = () => {
    return (
      <VStack space="md" className="mt-4">
        <View>
          <Text className="text-sm font-semibold mb-2 text-typography-700">
            {t('areaDetail.detailsSheet.triggerType')}
          </Text>
          <View className="flex-row gap-2 flex-wrap">
            {(['manual', 'webhook', 'cron'] as TriggerType[]).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setTriggerType(type)}
                className={`px-4 py-2 rounded-lg border ${
                  triggerType === type
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-surface border-outline-200'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    triggerType === type ? 'text-background-0' : 'text-typography-700'
                  }`}
                >
                  {t(`areaDetail.detailsSheet.triggerTypes.${type}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {triggerType === 'webhook' && (
          <>
            <View>
              <Text className="text-sm font-semibold mb-2 text-typography-700">
                {t('areaDetail.detailsSheet.webhookUrlLabel')}
              </Text>
              <Input variant="outline" size="md">
                <InputField
                  value={webhookUrl}
                  onChangeText={setWebhookUrl}
                  placeholder={t('areaDetail.detailsSheet.webhookUrlPlaceholder')}
                />
              </Input>
            </View>

            <View>
              <Text className="text-sm font-semibold mb-2 text-typography-700">
                {t('areaDetail.detailsSheet.serviceOptionalLabel')}
              </Text>
              {loading ? (
                <ActivityIndicator size="small" color="#6366f1" />
              ) : (
                <ScrollView className="max-h-40 border border-outline-200 rounded-lg bg-surface">
                  {services.map((service) => (
                    <TouchableOpacity
                      key={service.id}
                      onPress={() => setSelectedService(service)}
                      className={`p-3 border-b border-outline-100 ${
                        selectedService?.id === service.id ? 'bg-primary-50' : 'bg-surface'
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          selectedService?.id === service.id
                            ? 'font-semibold text-primary-700'
                            : 'text-typography-700'
                        }`}
                      >
                        {service.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </>
        )}

        {triggerType === 'cron' && (
          <View>
            <Text className="text-sm font-semibold mb-2 text-typography-700">
              {t('areaDetail.detailsSheet.cronLabel')}
            </Text>
            <Input variant="outline" size="md">
              <InputField
                value={cronExpression}
                onChangeText={setCronExpression}
                placeholder={t('areaDetail.detailsSheet.cronPlaceholder')}
              />
            </Input>
            <Text className="text-xs text-typography-500 mt-1">
              {t('areaDetail.detailsSheet.cronHelper')}
            </Text>
          </View>
        )}
      </VStack>
    );
  };

  const renderReactionSettings = () => {
    return (
      <VStack space="md" className="mt-4">
        <View>
          <Text className="text-sm font-semibold mb-2 text-typography-700">
            {t('areaDetail.detailsSheet.selectServiceLabel')}
          </Text>
          {loading ? (
            <ActivityIndicator size="small" color="#6366f1" />
          ) : (
            <ScrollView className="max-h-60 border border-outline-200 rounded-lg bg-surface">
              {services.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  onPress={() => setSelectedService(service)}
                  className={`flex-row gap-4 justify-between p-3 border-b border-outline-100 ${
                    selectedService?.id === service.id ? 'bg-primary-50' : 'bg-surface'
                  }`}
                >
                  <Text
                    className={`text-base ${
                      selectedService?.id === service.id
                        ? 'font-semibold text-primary-700'
                        : 'text-typography-700'
                    }`}
                  >
                    {service.name}
                  </Text>
                  <Text className="text-xs text-typography-500 mt-1">
                    {t('areaDetail.detailsSheet.authLabel')} {service.auth}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {selectedService && (
          <View className="p-3 bg-primary-50 rounded-lg">
            <Text className="text-sm text-primary-900">
              {t('areaDetail.detailsSheet.selectedService')}{' '}
              <Text className="font-semibold text-primary-900">{selectedService.name}</Text>
            </Text>
            <Text className="text-xs text-primary-700 mt-1">
              {t('areaDetail.detailsSheet.selectedServiceHelper')}
            </Text>
          </View>
        )}
      </VStack>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-background-0">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-outline-200 bg-background-0">
          <Heading size="lg">{t('areaDetail.detailsSheet.title')}</Heading>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 p-4">
          {card && (
            <VStack space="lg">
              {/* Card Type Badge */}
              <View className="bg-background-100 p-3 rounded-lg">
                <Text className="text-sm font-semibold text-typography-600 uppercase">
                  {card.type === 'action'
                    ? t('areaDetail.detailsSheet.cardType.action')
                    : t('areaDetail.detailsSheet.cardType.reaction')}
                </Text>
              </View>

              {/* Name Input */}
              <View>
                <Text className="text-sm font-semibold mb-2 text-typography-700">
                  {t('areaDetail.detailsSheet.nameLabel')}
                </Text>
                <Input variant="outline" size="md">
                  <InputField
                    value={name}
                    onChangeText={setName}
                    placeholder={t('areaDetail.detailsSheet.namePlaceholder')}
                  />
                </Input>
              </View>

              {/* Type-specific Settings */}
              {card.type === 'action' ? renderActionSettings() : renderReactionSettings()}
            </VStack>
          )}
        </ScrollView>

        {/* Footer */}
        <View className="p-4 border-t border-outline-200 bg-background-0">
          <View className="flex-row gap-3">
            <Button
              onPress={onClose}
              action="secondary"
              variant="outline"
              className="flex-1"
            >
              <ButtonText>{t('areaDetail.detailsSheet.cancel')}</ButtonText>
            </Button>
            <Button
              onPress={handleSave}
              action="primary"
              className="flex-1"
            >
              <ButtonText>{t('areaDetail.detailsSheet.save')}</ButtonText>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
