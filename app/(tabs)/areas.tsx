import React from 'react';
import { Zap } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heading } from '@/components/ui/heading';
import { Box } from '@/components/ui/box';
import { useTranslation } from 'react-i18next';

export default function AreasTab() {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-background-0 items-center justify-center">
      <Box className="items-center justify-center">
  <Zap size={48} color="#6366F1" />
        <Heading size="lg" className="text-typography-900 mt-4">
          {t('tabs.areas', 'Areas')}
        </Heading>
      </Box>
    </SafeAreaView>
  );
}
