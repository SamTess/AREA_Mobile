import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, BadgeText } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { useDesignTokens } from '@/components/ui/hooks/useDesignTokens';
import { HStack } from '@/components/ui/hstack';
import { Image } from '@/components/ui/image';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

const RecommendationCard: React.FC<{
  title: string;
  subtitle: string;
  imageUrl: string;
  onPress?: () => void;
}> = ({ title, subtitle, imageUrl, onPress }) => {
  const { t } = useTranslation();
  return (
    <Pressable onPress={onPress} testID={`rec-card-${title.replace(/\s+/g, '-')}` }>
      <Box className="bg-white rounded-lg p-4 shadow-soft-1 mr-4" style={{ width: 280, minWidth: 280 }}>
        <Image
          source={{ uri: imageUrl }}
          style={{ width: '100%', height: 160, borderRadius: 8, marginBottom: 12 }}
          resizeMode="cover"
          alt={title}
        />
        <VStack className="gap-1">
          <HStack space="sm" align="center">
            <Heading size="sm" className="text-typography-900">
              {title}
            </Heading>
            <Badge size="sm" variant="solid" action="success">
              <BadgeText>{t('common.popularBadge')}</BadgeText>
            </Badge>
          </HStack>
          <Text size="sm" className="text-typography-600">
            {subtitle}
          </Text>
        </VStack>
      </Box>
    </Pressable>
  );
};

const POPULAR_ITEMS = [
  {
    id: 1,
    title: "Restaurant Gastronomique",
    subtitle: "Une expérience culinaire exceptionnelle",
    imageUrl: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=100&h=100&fit=crop"
  },
  {
    id: 2,
    title: "Musée d'Art Moderne",
    subtitle: "Explorez les collections contemporaines",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop"
  },
  {
    id: 3,
    title: "Parc National",
    subtitle: "Reconnectez-vous avec la nature",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop"
  },
  {
    id: 4,
    title: "Centre Commercial",
    subtitle: "Shopping et divertissement",
    imageUrl: "https://images.unsplash.com/photo-1555529902-ce3e8653cd83?w=100&h=100&fit=crop"
  },
  {
    id: 5,
    title: "Théâtre Historic",
    subtitle: "Spectacles et performances artistiques",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
  },
  {
    id: 6,
    title: "Plage Paradisiaque",
    subtitle: "Détente et sports nautiques",
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100&h=100&fit=crop"
  },
  {
    id: 7,
    title: "Marché Local",
    subtitle: "Produits frais et artisanat",
    imageUrl: "https://images.unsplash.com/photo-1555617981-dac40e924671?w=100&h=100&fit=crop"
  },
  {
    id: 8,
    title: "Observatoire",
    subtitle: "Découverte de l'astronomie",
    imageUrl: "https://images.unsplash.com/photo-1419833479618-c595710f6026?w=100&h=100&fit=crop"
  }
];

const ITEMS_PER_PAGE = 3;

const PopularItem: React.FC<{
  title: string;
  subtitle: string;
  imageUrl: string;
  onPress?: () => void;
}> = ({ title, subtitle, imageUrl, onPress }) => {
  const { t } = useTranslation();
  const { getToken } = useDesignTokens();
  
  return (
    <Pressable onPress={onPress} testID={`popular-item-${title.replace(/\s+/g, '-')}` }>
      <Box className="bg-white rounded-lg p-4 shadow-soft-1 w-full">
        <HStack space="md" align="center" className="w-full">
          <Box className="flex-shrink-0">
            <Image
              source={{ uri: imageUrl }}
              style={{ width: 70, height: 70, borderRadius: 8 }}
              resizeMode="cover"
              alt={title}
            />
          </Box>
          <VStack className="flex-1 gap-1 pr-2">
            <HStack space="sm" align="center" className="flex-wrap">
              <Heading size="sm" className="text-typography-900 flex-shrink">
                {title}
              </Heading>
              <Badge size="sm" variant="solid" action="success">
                <BadgeText>{t('common.popularBadge')}</BadgeText>
              </Badge>
            </HStack>
            <Text size="sm" className="text-typography-600 flex-wrap">
              {subtitle}
            </Text>
          </VStack>
          <Box className="flex-shrink-0">
            <ChevronRight size={20} color={getToken('gray-500')} />
          </Box>
        </HStack>
      </Box>
    </Pressable>
  );
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const { getToken } = useDesignTokens();
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(POPULAR_ITEMS.length / ITEMS_PER_PAGE);
  
  const getCurrentPageItems = () => {
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return POPULAR_ITEMS.slice(startIndex, endIndex);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleItemPress = () => {
    router.push('/details');
  };

  const handleRecommendationPress = () => {
    router.push('/details');
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header */}
        <Box className="px-6 py-4">
          <Heading size="2xl" className="text-typography-900 mb-2">
            {t('home.greeting')}
          </Heading>
          <Text size="md" className="text-typography-600">
            {t('home.discover')}
          </Text>
        </Box>

        {/* Search Bar */}
        <Box className="mx-6 mb-6">
          <Button variant="ghost" className="p-0 w-full">
            <Input className="bg-white border-outline-200 pointer-events-none w-full">
              <InputSlot className="pl-3">
          <InputIcon as={Search} className="text-typography-400" size="sm" />
              </InputSlot>
              <InputField
                placeholder={t('home.searchPlaceholder')}
                className="text-typography-900"
                placeholderTextColor={getToken('gray-400')}
                editable={false}
              />
            </Input>
          </Button>
        </Box>

        {/* Recommended Section Header */}
        <HStack justify="between" align="center" className="px-6 mb-4">
          <Heading size="lg" className="text-typography-900">
            {t('home.recommended')}
          </Heading>
          <Button variant="link" size="sm">
            <ButtonText className="text-primary-600">
              {t('home.seeAll')}
            </ButtonText>
            <ButtonIcon as={ChevronRight} className="text-primary-600" size="sm" />
          </Button>
        </HStack>

        {/* Recommended Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
          contentContainerStyle={{ 
            paddingLeft: 24, 
            paddingRight: 24,
            alignItems: 'flex-start'
          }}
          decelerationRate="fast"
          snapToInterval={296}
          snapToAlignment="start"
        >
          <HStack space="md">
            <RecommendationCard
              title="Destination Tropicale"
              subtitle="Découvrez les plus belles plages du monde"
              imageUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop"
              onPress={handleRecommendationPress}
            />
            <RecommendationCard
              title="Aventure en Montagne"
              subtitle="Explorez les sommets les plus spectaculaires"
              imageUrl="https://images.unsplash.com/photo-1464822759844-d150baec93d1?w=400&h=200&fit=crop"
              onPress={handleRecommendationPress}
            />
            <RecommendationCard
              title="Ville Cosmopolite"
              subtitle="Plongez dans l'effervescence urbaine"
              imageUrl="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop"
              onPress={handleRecommendationPress}
            />
          </HStack>
        </ScrollView>

        {/* Additional Content Section */}
        <VStack className="gap-4 px-6">
          <HStack justify="between" align="center">
            <Heading size="lg" className="text-typography-900">
              {t('home.popularThisWeek')}
            </Heading>
            <Text size="sm" className="text-typography-500">
              {currentPage + 1} / {totalPages}
            </Text>
          </HStack>
          
          <VStack className="gap-2">
            {getCurrentPageItems().map((item, index) => (
              <VStack key={item.id}>
                <PopularItem
                  title={item.title}
                  subtitle={item.subtitle}
                  imageUrl={item.imageUrl}
                  onPress={handleItemPress}
                />
                {index < getCurrentPageItems().length - 1 && (
                  <Divider className="my-2" />
                )}
              </VStack>
            ))}
          </VStack>

          {/* Pagination Controls */}
          <HStack justify="between" align="center" className="mt-2">
            <Button 
              variant="outline" 
              size="sm"
              onPress={goToPreviousPage}
              disabled={currentPage === 0}
              className={`${currentPage === 0 ? 'opacity-50' : ''}`}
            >
              <ButtonIcon as={ChevronLeft} className="text-typography-600" size="sm" />
              <ButtonText className="text-typography-600">
                {t('home.previous')}
              </ButtonText>
            </Button>

            <HStack space="sm" align="center">
              {Array.from({ length: totalPages }, (_, index) => (
                <Button
                  key={index}
                  variant={index === currentPage ? "solid" : "outline"}
                  size="sm"
                  onPress={() => setCurrentPage(index)}
                  style={{ minWidth: 32, height: 32 }}
                  className={index === currentPage ? "bg-primary-600" : ""}
                >
                  <ButtonText 
                    className={index === currentPage ? "text-white" : "text-typography-600"}
                    size="sm"
                  >
                    {index + 1}
                  </ButtonText>
                </Button>
              ))}
            </HStack>

            <Button 
              variant="outline" 
              size="sm"
              onPress={goToNextPage}
              disabled={currentPage === totalPages - 1}
              className={`${currentPage === totalPages - 1 ? 'opacity-50' : ''}`}
            >
              <ButtonText className="text-typography-600">
                {t('home.next')}
              </ButtonText>
              <ButtonIcon as={ChevronRight} className="text-typography-600" size="sm" />
            </Button>
          </HStack>
        </VStack>

        {/* CTA Section */}
        <Box className="px-6 mt-8">
          <Box className="bg-primary-600 rounded-xl p-6 shadow-soft-2">
            <VStack className="gap-4">
              <VStack className="gap-2">
                <Heading size="lg" className="text-white">
                  {t('home.ctaTitle')}
                </Heading>
                <Text size="md" className="text-primary-100">
                  {t('home.ctaSubtitle')}
                </Text>
              </VStack>
              <Button 
                variant="solid" 
                size="md" 
                className="bg-white self-start"
              >
                <ButtonText className="text-primary-600 font-semibold">
                  {t('home.seeAll')}
                </ButtonText>
              </Button>
            </VStack>
          </Box>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}