import { BadgeCheck, Bell, HelpCircle, LogOut, Settings } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, AvatarBadge, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Badge, BadgeIcon, BadgeText } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { useDesignTokens } from '@/components/ui/hooks/useDesignTokens';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

const MenuItem: React.FC<{
  icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
  onPress?: () => void;
}> = ({ icon: Icon, title, subtitle, onPress }) => {
  const { getToken } = useDesignTokens();
  
  return (
    <Button variant="ghost" onPress={onPress} className="p-4">
      <HStack space="md" align="center" className="w-full">
        <Box className="w-10 h-10 bg-primary-50 rounded-full items-center justify-center">
          <Icon size={20} color={getToken('indigo-600')} />
        </Box>
        <VStack className="flex-1 gap-1">
          <Text className="text-typography-900 font-medium">
            {title}
          </Text>
          <Text size="sm" className="text-typography-600">
            {subtitle}
          </Text>
        </VStack>
      </HStack>
    </Button>
  );
};

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const isFrench = i18n.language?.startsWith('fr');
  const toggleLanguage = () => {
    i18n.changeLanguage(isFrench ? 'en' : 'fr');
  };
  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <Box className="px-6 py-4">
          <Heading size="2xl" className="text-typography-900 mb-2">
            {t('profile.title')}
          </Heading>
          <Text size="md" className="text-typography-600">
            {t('profile.subtitle')}
          </Text>
          <Box className="mt-3">
            <Button variant="outline" onPress={toggleLanguage}>
              <Text>
                {isFrench ? t('profile.toggleToEnglish') : t('profile.toggleToFrench')}
              </Text>
            </Button>
          </Box>
        </Box>

        {/* Profile Card */}
        <Box className="mx-6 mb-6 bg-surface rounded-lg p-6 shadow-soft-1">
          <HStack space="md" align="center">
            <Avatar size="xl">
              <AvatarFallbackText>John Doe</AvatarFallbackText>
              <AvatarImage
                source={{
                  uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
                }}
              />
              <AvatarBadge />
            </Avatar>
            <VStack className="flex-1 gap-2">
              <HStack space="sm" align="center">
                <Heading size="lg" className="text-typography-900">
                  John Doe
                </Heading>
                <Badge size="sm" variant="solid" action="success">
                  <BadgeText>{t('profile.verified')}</BadgeText>
                  <BadgeIcon as={BadgeCheck} />
                </Badge>
              </HStack>
              <Text className="text-typography-600">
                john.doe@example.com
              </Text>
              <Badge size="sm" variant="outline" action="info">
                <BadgeText>{t('profile.premium')}</BadgeText>
              </Badge>
            </VStack>
          </HStack>
        </Box>

        {/* Options */}
        <VStack className="mx-6 gap-2">
          <MenuItem
            icon={Settings}
            title={t('profile.settingsTitle')}
            subtitle={t('profile.settingsSubtitle')}
          />
          <Divider className="my-2" />
          <MenuItem
            icon={Bell}
            title={t('profile.notificationsTitle')}
            subtitle={t('profile.notificationsSubtitle')}
          />
          <MenuItem
            icon={HelpCircle}
            title={t('profile.helpTitle')}
            subtitle={t('profile.helpSubtitle')}
          />
          <Divider className="my-2" />
          <MenuItem
            icon={LogOut}
            title={t('profile.logoutTitle')}
            subtitle={t('profile.logoutSubtitle')}
          />
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}