import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, KeyRound, Languages, Moon, Save, Sun } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, AvatarBadge, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { useDesignTokens } from '@/components/ui/hooks/useDesignTokens';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/contexts/AuthContext';

export default function EditProfileScreen() {
  const { t, i18n } = useTranslation();
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const { getToken } = useDesignTokens();
  const { colorScheme, setColorScheme } = useColorScheme();

  const isFrench = i18n.language?.startsWith('fr');
  const isDark = colorScheme === 'dark';
  
  const toggleLanguage = () => {
    i18n.changeLanguage(isFrench ? 'en' : 'fr');
  };
  
  const toggleTheme = () => {
    setColorScheme(isDark ? 'light' : 'dark');
  };
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const getUserInitials = () => {
    if (!name) return user?.name ? user.name.substring(0, 2).toUpperCase() : 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string } = {};

    if (!name.trim()) {
      newErrors.name = t('editProfile.nameRequired');
    } else if (name.trim().length < 2) {
      newErrors.name = t('editProfile.nameTooShort');
    }

    if (!email.trim()) {
      newErrors.email = t('editProfile.emailRequired');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = t('editProfile.emailInvalid');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      if (updateUser) {
        await updateUser({
          ...user,
          name: name.trim(),
          email: email.trim(),
          avatar: avatar || user?.avatar,
        });
      }

      Alert.alert(
        t('editProfile.successTitle'),
        t('editProfile.successMessage'),
        [
          {
            text: t('editProfile.ok'),
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert(
        t('editProfile.error'),
        t('editProfile.updateError')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('editProfile.permissionDenied'),
        t('editProfile.cameraPermissionMessage')
      );
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('editProfile.permissionDenied'),
        t('editProfile.galleryPermissionMessage')
      );
      return false;
    }
    return true;
  };

  const pickImageFromCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert(
        t('editProfile.error'),
        t('editProfile.cameraError')
      );
    }
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert(
        t('editProfile.error'),
        t('editProfile.galleryError')
      );
    }
  };

  const handleChangePhoto = () => {
    Alert.alert(
      t('editProfile.changePhoto'),
      t('editProfile.changePhotoMessage'),
      [
        {
          text: t('editProfile.cancel'),
          style: 'cancel',
        },
        {
          text: t('editProfile.camera'),
          onPress: pickImageFromCamera,
        },
        {
          text: t('editProfile.gallery'),
          onPress: pickImageFromGallery,
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      {/* Header */}
      <Box className="px-6 py-4 border-b border-outline-100">
        <HStack space="md" align="center">
          <Pressable onPress={() => router.push('/(tabs)/profile')}>
            <Icon as={ArrowLeft} size="xl" className="text-typography-900" />
          </Pressable>
          <Heading size="xl" className="text-typography-900 flex-1">
            {t('editProfile.title')}
          </Heading>
          <Button
            size="sm"
            variant="solid"
            action="primary"
            onPress={handleSave}
            isDisabled={isLoading}
          >
            <ButtonIcon as={Save} />
            <ButtonText>{t('editProfile.save')}</ButtonText>
          </Button>
        </HStack>
      </Box>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Avatar Section */}
        <Box className="items-center py-8">
          <Box className="relative">
            <Avatar size="2xl">
              <AvatarFallbackText>{getUserInitials()}</AvatarFallbackText>
              {(avatar || user?.avatar) && (
                <AvatarImage
                  source={{
                    uri: avatar || user?.avatar,
                  }}
                />
              )}
              <AvatarBadge />
            </Avatar>
            <Pressable
              onPress={handleChangePhoto}
              className="absolute bottom-0 right-0 bg-background-0 rounded-full p-3 border-2 border-primary-500"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 6,
              }}
            >
              <Camera size={20} color={getToken('primary-500')} />
            </Pressable>
          </Box>
          <Text className="text-typography-600 mt-3">
            {t('editProfile.changePhoto')}
          </Text>
        </Box>

        {/* Form Section */}
        <VStack className="px-6 gap-6">
          {/* Name Field */}
          <VStack className="gap-2">
            <Text className="text-typography-900 font-medium">
              {t('editProfile.nameLabel')}
            </Text>
            <Input 
              variant="outline" 
              size="lg"
              isInvalid={!!errors.name}
            >
              <InputField
                placeholder={t('editProfile.namePlaceholder')}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) {
                    setErrors({ ...errors, name: undefined });
                  }
                }}
              />
            </Input>
            {errors.name && (
              <Text size="sm" className="text-error-600">
                {errors.name}
              </Text>
            )}
          </VStack>

          {/* Email Field */}
          <VStack className="gap-2">
            <Text className="text-typography-900 font-medium">
              {t('editProfile.emailLabel')}
            </Text>
            <Input 
              variant="outline" 
              size="lg"
              isInvalid={!!errors.email}
            >
              <InputField
                placeholder={t('editProfile.emailPlaceholder')}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) {
                    setErrors({ ...errors, email: undefined });
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </Input>
            {errors.email && (
              <Text size="sm" className="text-error-600">
                {errors.email}
              </Text>
            )}
          </VStack>

          <Divider className="my-2" />

          {/* Password Change Button */}
          <VStack className="gap-2">
            <Text className="text-typography-900 font-medium">
              {t('editProfile.passwordLabel')}
            </Text>
            <Button
              variant="outline"
              size="lg"
              onPress={() => router.push('/(tabs)/forgot-password')}
            >
              <ButtonIcon as={KeyRound} />
              <ButtonText>{t('editProfile.changePassword')}</ButtonText>
            </Button>
            <Text size="sm" className="text-typography-500">
              {t('editProfile.passwordHelper')}
            </Text>
          </VStack>

          <Divider className="my-2" />

          {/* Language and Theme Settings */}
          <VStack className="gap-4 mt-3">
            <Text className="text-typography-900 font-medium">
              {t('editProfile.preferencesLabel')}
            </Text>
            
            {/* Language Toggle */}
            <Button
              variant="outline"
              size="lg"
              onPress={toggleLanguage}
            >
              <ButtonIcon as={Languages} />
              <ButtonText>
                {isFrench ? t('profile.toggleToEnglish') : t('profile.toggleToFrench')}
              </ButtonText>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="lg"
              onPress={toggleTheme}
            >
              <ButtonIcon as={isDark ? Sun : Moon} />
              <ButtonText>
                {isDark ? t('editProfile.switchToLight') : t('editProfile.switchToDark')}
              </ButtonText>
            </Button>
          </VStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
