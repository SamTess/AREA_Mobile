import React, { useCallback } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { Zap, Plus } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Heading } from '@/components/ui/heading';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { useTranslation } from 'react-i18next';
import { AreaListCard } from '@/components/ui/areas/AreaListCard';
import { useArea } from '@/contexts/AreaContext';

// Loading Screen Component
function LoadingScreen() {
  const { t } = useTranslation();
  return (
    <SafeAreaView className="flex-1 bg-background-0 items-center justify-center">
      <Box className="items-center justify-center">
        <Zap size={48} color="#6366F1" />
        <Heading size="lg" className="text-typography-900 mt-4">
          {t('areas.loading.title', 'Loading Areas...')}
        </Heading>
      </Box>
    </SafeAreaView>
  );
}

export default function AreasTab() {
  const { t } = useTranslation();
  const {
    areas,
    createArea,
    isLoading,
    isRefreshing,
    error,
    refreshAreas,
    clearError,
  } = useArea();

  const handleRefresh = useCallback(() => {
    refreshAreas().catch(err => console.error(t('areas.error.refresh', 'Failed to refresh areas'), err));
  }, [refreshAreas, t]);

  const handleAreaPress = (areaId: string) => {
    router.push(`/area-detail?id=${areaId}`);
  };

  const handleCreateArea = () => {
    createArea({
      name: t('areas.create.defaultName', 'New Area'),
      description: '',
      enabled: false,
      actions: [],
      reactions: [],
    });
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      {/* Header */}
      <Box className="bg-background-0 px-4 pt-4 pb-2">
        <HStack className="items-center justify-between mb-2">
          <HStack className="items-center" space="sm">
            <Box className="bg-primary-500 rounded-lg p-2">
              <Zap size={24} color="white" />
            </Box>
            <Heading size="xl" className="text-typography-900">
              {t('tabs.areas', 'Areas')}
            </Heading>
          </HStack>
          <Button size="sm" onPress={handleCreateArea}>
            <ButtonIcon as={Plus} />
            <ButtonText>{t('areas.header.newButton', 'New')}</ButtonText>
          </Button>
        </HStack>
        <Text className="text-typography-600 text-sm">
          {t('areas.header.subtitle', 'Manage your automated workflows')}
        </Text>
        {error && (
          <Box className="bg-danger-50 border border-danger-200 rounded-md px-3 py-2 mt-3">
            <HStack className="items-center justify-between">
              <Text className="text-danger-700 text-xs flex-1">
                {error}
              </Text>
              <Button size="xs" variant="link" action="negative" onPress={clearError}>
                <ButtonText className="text-xs">{t('areas.error.dismiss', 'Dismiss')}</ButtonText>
              </Button>
            </HStack>
          </Box>
        )}
      </Box>

      {/* Areas List */}
      <FlatList
        data={areas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AreaListCard
            area={item}
            onPress={() => handleAreaPress(item.id)}
          />
        )}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 16,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#6366F1"
          />
        }
        ListEmptyComponent={
          <Box className="items-center justify-center py-12">
            <Zap size={64} color="#D1D5DB" />
            <Heading size="md" className="text-typography-600 mt-4">
              {t('areas.empty.title', 'No Areas Yet')}
            </Heading>
            <Text className="text-typography-500 text-center mt-2 px-8">
              {t('areas.empty.description', 'Create your first automation area to get started')}
            </Text>
            <Button size="md" className="mt-6" onPress={handleCreateArea}>
              <ButtonIcon as={Plus} />
              <ButtonText>{t('areas.empty.action', 'Create Area')}</ButtonText>
            </Button>
          </Box>
        }
      />
    </SafeAreaView>
  );
}
