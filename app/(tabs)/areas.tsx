import React, { useState, useEffect } from 'react';
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
import type { AreaDto } from '@/types/areas';
import areasData from '@/mocks/areas.json';

// Loading Screen Component
function LoadingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background-0 items-center justify-center">
      <Box className="items-center justify-center">
        <Zap size={48} color="#6366F1" />
        <Heading size="lg" className="text-typography-900 mt-4">
          Loading Areas...
        </Heading>
      </Box>
    </SafeAreaView>
  );
}

export default function AreasTab() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [areas, setAreas] = useState<AreaDto[]>([]);

  // Simulate loading data
  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setAreas(areasData.areas as AreaDto[]);
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAreas();
    setIsRefreshing(false);
  };

  const handleAreaPress = (areaId: string) => {
    router.push(`/area-detail?id=${areaId}`);
  };

  const handleCreateArea = () => {
    // Navigate to create area screen (to be implemented)
    console.log('Create new area');
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
            <ButtonText>New</ButtonText>
          </Button>
        </HStack>
        <Text className="text-typography-600 text-sm">
          Manage your automated workflows
        </Text>
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
              No Areas Yet
            </Heading>
            <Text className="text-typography-500 text-center mt-2 px-8">
              Create your first automation area to get started
            </Text>
            <Button size="md" className="mt-6" onPress={handleCreateArea}>
              <ButtonIcon as={Plus} />
              <ButtonText>Create Area</ButtonText>
            </Button>
          </Box>
        }
      />
    </SafeAreaView>
  );
}
