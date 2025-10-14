import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { X } from 'lucide-react-native';

import type { CardData, ActionDto, ReactionDto } from '@/types/area-detail';
import type { Service } from '@/types/services';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';

interface CardDetailsSheetProps {
  visible: boolean;
  card: CardData | null;
  onClose: () => void;
  onSave?: (card: CardData) => void;
}

type TriggerType = 'cron' | 'webhook' | 'manual';

export function CardDetailsSheet({ visible, card, onClose, onSave }: CardDetailsSheetProps) {
  const [editedCard, setEditedCard] = useState<CardData | null>(null);
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState<TriggerType>('manual');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [cronExpression, setCronExpression] = useState('');

  // Load services from mock data
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

  // Initialize form when card changes
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
          secret_token: '', // Can be added later
        }),
        ...(triggerType === 'cron' && {
          cron_expression: cronExpression
        }),
      };

      // If webhook trigger is selected and a service is chosen
      if (triggerType === 'webhook' && selectedService) {
        // Store service reference in parameters
        actionData.parameters = {
          ...actionData.parameters,
          serviceId: selectedService.id,
          serviceName: selectedService.name,
        };
      }
    } else if (editedCard.type === 'reaction') {
      const reactionData = updatedCard.data as ReactionDto;
      // For reactions, store the selected service
      if (selectedService) {
        reactionData.parameters = {
          ...reactionData.parameters,
          serviceId: selectedService.id,
          serviceName: selectedService.name,
        };
      }
    }

    onSave?.(updatedCard);
    onClose();
  };

  const renderActionSettings = () => {
    return (
      <VStack space="md" className="mt-4">
        <View>
          <Text className="text-sm font-semibold mb-2 text-gray-700">Trigger Type</Text>
          <View className="flex-row gap-2 flex-wrap">
            {(['manual', 'webhook', 'cron'] as TriggerType[]).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setTriggerType(type)}
                className={`px-4 py-2 rounded-lg border ${
                  triggerType === type
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-white border-gray-300'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    triggerType === type ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {triggerType === 'webhook' && (
          <>
            <View>
              <Text className="text-sm font-semibold mb-2 text-gray-700">Webhook URL</Text>
              <Input variant="outline" size="md">
                <InputField
                  value={webhookUrl}
                  onChangeText={setWebhookUrl}
                  placeholder="https://example.com/webhook"
                />
              </Input>
            </View>

            <View>
              <Text className="text-sm font-semibold mb-2 text-gray-700">Service (Optional)</Text>
              {loading ? (
                <ActivityIndicator size="small" color="#6366f1" />
              ) : (
                <ScrollView className="max-h-40 border border-gray-300 rounded-lg">
                  {services.map((service) => (
                    <TouchableOpacity
                      key={service.id}
                      onPress={() => setSelectedService(service)}
                      className={`p-3 border-b border-gray-200 ${
                        selectedService?.id === service.id ? 'bg-primary-50' : 'bg-white'
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          selectedService?.id === service.id
                            ? 'font-semibold text-primary-700'
                            : 'text-gray-700'
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
            <Text className="text-sm font-semibold mb-2 text-gray-700">Cron Expression</Text>
            <Input variant="outline" size="md">
              <InputField
                value={cronExpression}
                onChangeText={setCronExpression}
                placeholder="*/5 * * * *"
              />
            </Input>
            <Text className="text-xs text-gray-500 mt-1">
              Example: */5 * * * * (every 5 minutes)
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
          <Text className="text-sm font-semibold mb-2 text-gray-700">Select Service</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#6366f1" />
          ) : (
            <ScrollView className="max-h-60 border border-gray-300 rounded-lg">
              {services.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  onPress={() => setSelectedService(service)}
                  className={`flex-row gap-4 justify-between p-3 border-b border-gray-200 ${
                    selectedService?.id === service.id ? 'bg-primary-50' : 'bg-white'
                  }`}
                >
                  <Text
                    className={`text-base ${
                      selectedService?.id === service.id
                        ? 'font-semibold text-primary-700'
                        : 'text-gray-700'
                    }`}
                  >
                    {service.name}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    Auth: {service.auth}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {selectedService && (
          <View className="p-3 bg-blue-50 rounded-lg">
            <Text className="text-sm text-blue-900">
              Selected: <Text className="font-semibold">{selectedService.name}</Text>
            </Text>
            <Text className="text-xs text-blue-700 mt-1">
              Action selection will be available in the next step
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
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-white">
          <Heading size="lg">Edit Card Settings</Heading>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 p-4">
          {card && (
            <VStack space="lg">
              {/* Card Type Badge */}
              <View className="bg-gray-100 p-3 rounded-lg">
                <Text className="text-sm font-semibold text-gray-600 uppercase">
                  {card.type === 'action' ? '⚡ Action (Trigger)' : '⚙️ Reaction'}
                </Text>
              </View>

              {/* Name Input */}
              <View>
                <Text className="text-sm font-semibold mb-2 text-gray-700">Name</Text>
                <Input variant="outline" size="md">
                  <InputField
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter card name"
                  />
                </Input>
              </View>

              {/* Type-specific Settings */}
              {card.type === 'action' ? renderActionSettings() : renderReactionSettings()}
            </VStack>
          )}
        </ScrollView>

        {/* Footer */}
        <View className="p-4 border-t border-gray-200 bg-white">
          <View className="flex-row gap-3">
            <Button
              onPress={onClose}
              action="secondary"
              variant="outline"
              className="flex-1"
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              onPress={handleSave}
              action="primary"
              className="flex-1"
            >
              <ButtonText>Save Changes</ButtonText>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
