import React, { useState, useEffect } from 'react';
import { FlatList, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Link as LinkIcon, Unlink, ExternalLink } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Pressable } from '@/components/ui/pressable';
import * as serviceCatalog from '@/services/serviceCatalog';
import * as serviceConnection from '@/services/serviceConnection';
import type { BackendService } from '@/types/areas';
import type { ServiceConnectionStatus } from '@/services/serviceConnection';

interface ServiceCardProps {
  service: BackendService & { connectionStatus?: ServiceConnectionStatus };
  onConnect: (service: BackendService) => void;
  onDisconnect: (service: BackendService) => void;
}

function ServiceCard({ service, onConnect, onDisconnect }: ServiceCardProps) {
  const { t } = useTranslation();
  const isConnected = !!service.connectionStatus?.isConnected;
  const iconUrl = service.connectionStatus?.iconUrl || service.iconLightUrl;
  const userName = service.connectionStatus?.userName;
  const userEmail = service.connectionStatus?.userEmail;
  return (
    <Box className="bg-background-50 rounded-lg p-4 mb-3 border border-outline-100">
      <VStack space="sm">
        <HStack space="md" className="items-center">
          <Box className="w-12 h-12 bg-primary-100 rounded-lg items-center justify-center">
            <Text className="text-primary-600 font-bold text-lg">
              {service.name.charAt(0)}
            </Text>
          </Box>
          <VStack className="flex-1">
            <HStack space="xs" className="items-center mb-1">
              <Text className="text-typography-900 font-semibold">
                {service.name}
              </Text>
              <Badge
                size="sm"
                variant="solid"
                action={isConnected ? 'success' : 'muted'}
              >
                <BadgeText className="text-xs">
                  {isConnected
                    ? t('services.connected', 'Connected')
                    : t('services.notConnected', 'Not Connected')}
                </BadgeText>
              </Badge>
            </HStack>
            {isConnected && userName && (
              <Text className="text-typography-600 text-xs">
                {userName}
              </Text>
            )}
          </VStack>
        </HStack>
        <HStack space="sm" className="mt-2">
          {isConnected ? (
            <Button
              size="sm"
              variant="outline"
              action="negative"
              onPress={() => onDisconnect(service)}
              className="flex-1"
            >
              <ButtonIcon as={Unlink} size="sm" />
              <ButtonText>{t('services.disconnect', 'Disconnect')}</ButtonText>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="solid"
              action="primary"
              onPress={() => onConnect(service)}
              className="flex-1"
            >
              <ButtonIcon as={LinkIcon} size="sm" />
              <ButtonText>{t('services.connect', 'Connect')}</ButtonText>
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  );
}

export default function ConnectedServicesScreen() {
  const { t } = useTranslation();
  const [services, setServices] = useState<Array<BackendService & { connectionStatus?: ServiceConnectionStatus }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const catalog = await serviceCatalog.getServicesCatalog();
      const connectedServices = await serviceConnection.getConnectedServices();
      const servicesWithStatus = catalog.map(service => {
        const connectionStatus = connectedServices.find(cs => cs.serviceKey === service.key);
        return {
          ...service,
          connectionStatus,
        };
      });
      setServices(servicesWithStatus);
    } catch (error) {
      console.error('Failed to load services:', error);
      Alert.alert(
        t('services.error', 'Error'),
        t('services.loadError', 'Failed to load services')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (service: BackendService) => {
    try {
      const provider = serviceConnection.mapServiceKeyToOAuthProvider(service.key);
      const oauthUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/oauth/${provider}/authorize`;
      Alert.alert(
        t('services.connect', 'Connect Service'),
        t('services.connectMessage', `You will be redirected to ${service.name} to authorize the connection.`),
        [
          { text: t('common.cancel', 'Cancel'), style: 'cancel' },
          {
            text: t('common.continue', 'Continue'),
            onPress: async () => {
              const supported = await Linking.canOpenURL(oauthUrl);
              if (supported) {
                await Linking.openURL(oauthUrl);
                setTimeout(() => loadServices(), 2000);
              } else {
                Alert.alert(
                  t('services.error', 'Error'),
                  t('services.cantOpen', 'Cannot open OAuth page')
                );
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Failed to connect service:', error);
      Alert.alert(
        t('services.error', 'Error'),
        t('services.connectError', 'Failed to connect service')
      );
    }
  };

  const handleDisconnect = async (service: BackendService & { connectionStatus?: ServiceConnectionStatus }) => {
    const connectionStatus = service.connectionStatus;
    if (connectionStatus?.isPrimaryAuth) {
      Alert.alert(
        t('services.error', 'Error'),
        t('services.cannotDisconnect', 'Cannot disconnect your primary authentication method')
      );
      return;
    }

    if (connectionStatus?.canDisconnect === false) {
      Alert.alert(
        t('services.error', 'Error'),
        t('services.cannotDisconnect', 'This service cannot be disconnected at this time')
      );
      return;
    }

    Alert.alert(
      t('services.disconnect', 'Disconnect Service'),
      t('services.disconnectMessage', `Are you sure you want to disconnect ${service.name}?`),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('services.disconnect', 'Disconnect'),
          style: 'destructive',
          onPress: async () => {
            try {
              await serviceConnection.disconnectService(service.key);
              Alert.alert(
                t('services.success', 'Success'),
                t('services.disconnected', `${service.name} has been disconnected`)
              );
              await loadServices();
            } catch (error) {
              console.error('Failed to disconnect service:', error);
              Alert.alert(
                t('services.error', 'Error'),
                t('services.disconnectError', 'Failed to disconnect service')
              );
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <Box className="bg-background-0 px-4 pt-4 pb-3 border-b border-outline-100">
        <HStack className="items-center justify-between mb-3">
          <HStack space="sm" className="items-center flex-1">
            <Button size="xs" variant="link" onPress={() => router.back()}>
              <ButtonIcon as={ArrowLeft} />
            </Button>
            <Heading size="lg" className="text-typography-900">
              {t('services.title', 'Connected Services')}
            </Heading>
          </HStack>
        </HStack>
        <Text className="text-typography-600 text-sm">
          {t('services.subtitle', 'Manage your service connections for automations')}
        </Text>
      </Box>

      {isLoading ? (
        <Box className="flex-1 items-center justify-center">
          <Text className="text-typography-600">
            {t('common.loading', 'Loading...')}
          </Text>
        </Box>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          )}
          contentContainerStyle={{
            padding: 16,
          }}
          ListEmptyComponent={
            <Box className="items-center justify-center py-12">
              <Text className="text-typography-500 text-center">
                {t('services.empty', 'No services available')}
              </Text>
            </Box>
          }
        />
      )}
    </SafeAreaView>
  );
}
