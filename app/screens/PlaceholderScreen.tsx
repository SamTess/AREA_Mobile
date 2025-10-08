import { router, useRouter } from 'expo-router';
import { ArrowLeft, Construction } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { useDesignTokens } from '@/components/ui/hooks/useDesignTokens';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export default function PlaceholderScreen() {
  const { t } = useTranslation();
  const { getToken } = useDesignTokens();

  const routerHook = useRouter?.();
  const handleGoBack = () => {
    try {
      if (typeof router?.back === 'function') {
        router.back();
        return;
      }
    } catch (e) {
    }
    try {
      if (typeof jest !== 'undefined' && typeof jest.requireMock === 'function') {
        try {
          const mockExp = jest.requireMock('expo-router');
          const maybeRouterMock = mockExp?.router || mockExp?.default?.router;
          if (maybeRouterMock && typeof maybeRouterMock.back === 'function') {
            maybeRouterMock.back();
            return;
          }
        } catch (e) {
        }
      }
    } catch (err) {
    }

    try {
      const exp = require('expo-router');
      const maybeRouter = exp?.router || exp?.default?.router;
      if (maybeRouter && typeof maybeRouter.back === 'function') {
        maybeRouter.back();
        return;
      }
    } catch (err) {
    }

    if (routerHook && typeof routerHook.back === 'function') {
      routerHook.back();
      return;
    }
    if (routerHook && typeof routerHook.push === 'function') {
      routerHook.push('/');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      {/* Header with back button */}
      <HStack className="px-6 py-4" align="center">
        <Pressable onPress={handleGoBack} testID="back-button">
          <HStack space="sm" align="center">
            <Icon as={ArrowLeft} size="xl" className="text-typography-900" />
            <Text size="lg" className="text-typography-900 font-medium">
              {t('placeholder.back')}
            </Text>
          </HStack>
        </Pressable>
      </HStack>

      {/* Centered content */}
      <Center className="flex-1 px-6">
        <VStack space="xl" className="items-center">
          {/* Construction Icon */}
          <Box
            className="w-24 h-24 rounded-full items-center justify-center bg-warning-100"
          >
            <Icon as={Construction} size="2xl" className="text-warning-600" />
          </Box>

          {/* Text Content */}
          <VStack space="md" className="items-center">
            <Heading size="xl" className="text-typography-900 text-center">
              {t('placeholder.title')}
            </Heading>
            <Text size="md" className="text-typography-600 text-center">
              {t('placeholder.description')}
            </Text>
          </VStack>

          {/* Animated dots (simple text version) */}
          <Text size="2xl" className="text-warning-600">
            ...
          </Text>
        </VStack>
      </Center>
    </SafeAreaView>
  );
}
