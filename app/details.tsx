import { router } from 'expo-router';
import { ArrowLeft, Heart, MapPin, Share2, Star } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useTranslation } from 'react-i18next';

export default function DetailsScreen() {
  const { t } = useTranslation();
  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header with back button */}
        <HStack justify="between" align="center" className="px-6 py-4">
          <Button variant="ghost" size="sm" onPress={handleGoBack} testID="back-button">
            <ButtonIcon as={ArrowLeft} className="text-typography-600" size="sm" />
          </Button>
          <HStack space="sm">
            <Button variant="ghost" size="sm">
              <ButtonIcon as={Heart} className="text-typography-600" size="sm" />
            </Button>
            <Button variant="ghost" size="sm">
              <ButtonIcon as={Share2} className="text-typography-600" size="sm" />
            </Button>
          </HStack>
        </HStack>

        {/* Main Image */}
        <Box className="px-6 mb-6">
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800&h=400&fit=crop" }}
            style={{ width: '100%', height: 200, borderRadius: 12 }}
            resizeMode="cover"
          />
        </Box>

        {/* Content */}
        <VStack className="px-6 gap-4">
          <VStack className="gap-2">
            <Heading size="2xl" className="text-typography-900">
              Restaurant Gastronomique
            </Heading>
            <HStack space="sm" align="center">
              <MapPin size={16} color="#6B7280" />
              <Text className="text-typography-600">
                {t('details.address')}
              </Text>
            </HStack>
            <HStack space="sm" align="center">
              <Star size={16} color="#FCD34D" />
              <Text className="text-typography-600">
                {t('details.reviews')}
              </Text>
            </HStack>
          </VStack>

          <Text className="text-typography-700 leading-6">
            {t('details.description')}
          </Text>

          {/* Features */}
          <VStack className="gap-3">
            <Heading size="lg" className="text-typography-900">
              {t('details.features')}
            </Heading>
            <VStack className="gap-2">
              <HStack space="sm" align="center">
                <Box className="w-2 h-2 bg-primary-600 rounded-full" />
                <Text className="text-typography-700">{t('details.featureCuisine')}</Text>
              </HStack>
              <HStack space="sm" align="center">
                <Box className="w-2 h-2 bg-primary-600 rounded-full" />
                <Text className="text-typography-700">{t('details.featureReservation')}</Text>
              </HStack>
              <HStack space="sm" align="center">
                <Box className="w-2 h-2 bg-primary-600 rounded-full" />
                <Text className="text-typography-700">{t('details.featureTerrace')}</Text>
              </HStack>
              <HStack space="sm" align="center">
                <Box className="w-2 h-2 bg-primary-600 rounded-full" />
                <Text className="text-typography-700">{t('details.featureParking')}</Text>
              </HStack>
            </VStack>
          </VStack>

          {/* Action Buttons */}
          <VStack className="gap-3 mt-4">
            <Button variant="solid" size="lg">
              <ButtonText>{t('details.bookTable')}</ButtonText>
            </Button>
            <HStack space="sm">
              <Button variant="outline" className="flex-1">
                <ButtonText>{t('details.call')}</ButtonText>
              </Button>
              <Button variant="outline" className="flex-1">
                <ButtonText>{t('details.directions')}</ButtonText>
              </Button>
            </HStack>
          </VStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}