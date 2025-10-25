import { useRouter } from 'expo-router';
import { BadgeCheck, LogOut, ShieldCheck, Edit, Link as LinkIcon } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { Avatar, AvatarBadge, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { useDesignTokens } from '@/components/ui/hooks/useDesignTokens';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentUser } from '@/services/auth';
import { User } from '@/types/auth';

const MenuItem: React.FC<{
  icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
  onPress?: () => void;
}> = ({ icon: Icon, title, subtitle, onPress }) => {
  const { getToken } = useDesignTokens();

  return (
    <Pressable onPress={onPress} className="p-4 rounded-lg active:bg-background-100">
      <HStack space="md" align="center" className="w-full">
        <Box className="w-10 h-10 bg-background-100 rounded-full items-center justify-center">
          <Icon size={20} color={getToken('typography-900')} />
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
    </Pressable>
  );
};

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user: contextUser, logout } = useAuth();
  const router = useRouter();
  const { getToken } = useDesignTokens();
  const [user, setUser] = useState<User | null>(contextUser);
  const [isLoading, setIsLoading] = useState(false);
  useFocusEffect(
    React.useCallback(() => {
      const loadUserData = async () => {
        try {
          setIsLoading(true);
          const userData = await getCurrentUser();
          if (userData) {
            setUser(userData);
          }
        } catch (error) {
          console.error('Failed to load user data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadUserData();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert(
      t('profile.logoutTitle'),
      t('profile.logoutConfirmation'),
      [
        {
          text: t('profile.cancel'),
          style: 'cancel',
        },
        {
          text: t('profile.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/(tabs)/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert(
                t('profile.error'),
                t('profile.logoutError')
              );
            }
          },
        },
      ]
    );
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  const getUserFullName = () => {
    return user?.name || t('profile.unknownUser');
  };

  const getUserEmail = () => {
    return user?.email || t('profile.noEmail');
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-0">
        <Box className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={getToken('primary-500')} />
          <Text className="text-typography-600 mt-4">
            {t('profile.loading', 'Loading profile...')}
          </Text>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        <Box className="px-6 py-4">
          <Heading size="2xl" className="text-typography-900 mb-2">
            {t('profile.title')}
          </Heading>
          <Text size="md" className="text-typography-600">
            {t('profile.subtitle')}
          </Text>
        </Box>

        <Box className="mx-6 mb-6 bg-background-50 rounded-lg p-6 shadow-soft-1">
          <HStack space="md" align="center">
            <Avatar size="xl">
              <AvatarFallbackText>{getUserInitials()}</AvatarFallbackText>
              {user?.avatarUrl && (
                <AvatarImage
                  source={{
                    uri: user.avatarUrl,
                  }}
                />
              )}
              <AvatarBadge />
            </Avatar>
            <VStack className="flex-1 gap-2">
              <HStack space="sm" align="center">
                <Heading size="lg" className="text-typography-900">
                  {getUserFullName()}
                </Heading>
              </HStack>
              <Text className="text-typography-600">
                {getUserEmail()}
              </Text>
              {user?.username && (
                <Text size="sm" className="text-typography-500">
                  @{user.username}
                </Text>
              )}
            </VStack>
          </HStack>
        </Box>

        <VStack className="mx-6 gap-2">
          {(user as any)?.isAdmin && (
            <>
              <MenuItem
                icon={ShieldCheck}
                title={t('profile.adminDashboard')}
                subtitle={t('profile.adminDashboardSubtitle')}
                onPress={() => router.push('/(tabs)/admin-dashboard')}
              />
              <Divider className="my-2" />
            </>
          )}
          <Text className="text-xs font-semibold text-typography-500 uppercase mb-2">
            {t('profile.profileSection', 'Profile Management')}
          </Text>
          <MenuItem
            icon={Edit}
            title={t('profile.editProfile', 'Edit Profile')}
            subtitle={t('profile.editProfileSubtitle', 'Update your personal information')}
            onPress={() => router.push('/(tabs)/edit-profile')}
          />
          <Divider className="my-2" />

          <Text className="text-xs font-semibold text-typography-500 uppercase mb-2 mt-4">
            {t('profile.servicesSection', 'Connected Services')}
          </Text>
          <MenuItem
            icon={LinkIcon}
            title={t('profile.connectedServices', 'Connected Services')}
            subtitle={t('profile.connectedServicesSubtitle', 'Manage service connections')}
            onPress={() => router.push('/connected-services')}
          />
          <Divider className="my-2" />

          <MenuItem
            icon={LogOut}
            title={t('profile.logoutTitle')}
            subtitle={t('profile.logoutSubtitle')}
            onPress={handleLogout}
          />
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}