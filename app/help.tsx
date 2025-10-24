import { Mail, Github, MessageCircle, Send, Clock, Phone, Globe, AlertCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  Linking,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';

import { Badge, BadgeText } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { useDesignTokens } from '@/components/ui/hooks/useDesignTokens';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

interface ContactMethod {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  value: string;
  link: string;
  color: string;
}

const ContactCard: React.FC<ContactMethod> = ({ icon: Icon, title, description, value, link }) => {
  const handlePress = async () => {
    try {
      const canOpen = await Linking.canOpenURL(link);
      if (canOpen) await Linking.openURL(link);
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  return (
    <Pressable onPress={handlePress} className="mb-4">
      <Box className="bg-background-50 rounded-2xl p-6 shadow-soft-1 border border-outline-100">
        <VStack space="md" className="items-center">
          <Box className="w-16 h-16 bg-primary-500 rounded-full items-center justify-center">
            <Icon size={32} color="#FFFFFF" />
          </Box>
          <VStack space="xs" className="items-center">
            <Text className="text-typography-900 font-bold text-lg text-center">{title}</Text>
            <Text size="sm" className="text-typography-600 text-center">{description}</Text>
          </VStack>
          <Badge size="md" variant="solid" action="info" className="w-full">
            <BadgeText className="text-center w-full">{value}</BadgeText>
          </Badge>
        </VStack>
      </Box>
    </Pressable>
  );
};

const InfoCard: React.FC<{
  icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
}> = ({ icon: Icon, title, subtitle }) => {
  const { getToken } = useDesignTokens();
  return (
    <Box className="bg-background-50 rounded-xl p-4 shadow-soft-1 border border-outline-100 flex-1">
      <VStack space="sm" className="items-center">
        <Box className="w-10 h-10 bg-background-100 rounded-full items-center justify-center">
          <Icon size={20} color={getToken('primary-500')} />
        </Box>
        <Text className="text-typography-900 font-semibold text-center">{title}</Text>
        <Text size="sm" className="text-typography-600 text-center">{subtitle}</Text>
      </VStack>
    </Box>
  );
};

export default function HelpScreen() {
  const { t } = useTranslation();
  const headerHeight = useHeaderHeight();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [messageHeight, setMessageHeight] = useState(120);

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.message) {
      Alert.alert(t('help.errorTitle'), t('help.errorMessage'));
      return;
    }

    console.log('Form submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setMessageHeight(120);

    Alert.alert(t('help.successTitle'), t('help.successMessage'));
    setTimeout(() => setSubmitted(false), 3000);
  };

  const contactMethods: ContactMethod[] = [
    {
      icon: Mail,
      title: t('help.emailTitle'),
      description: t('help.emailDescription'),
      value: 'support@area-platform.com',
      link: 'mailto:support@area-platform.com',
      color: 'blue',
    },
    {
      icon: Github,
      title: t('help.githubTitle'),
      description: t('help.githubDescription'),
      value: 'github.com/area',
      link: 'https://github.com/SamTess/AREA',
      color: 'dark',
    },
    {
      icon: MessageCircle,
      title: t('help.discordTitle'),
      description: t('help.discordDescription'),
      value: t('help.discordValue'),
      link: 'https://discord.gg',
      color: 'indigo',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background-0" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1 bg-background-0"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={headerHeight}
      >
        <ScrollView
          className="flex-1 bg-background-0"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'on-drag' : 'none'}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* Header */}
          <Box className="px-6 py-6">
            <Heading size="3xl" className="text-typography-900 mb-2 text-center">
              {t('help.title')}
            </Heading>
            <Text size="lg" className="text-typography-600 text-center">{t('help.subtitle')}</Text>
          </Box>

          {/* Contact Methods */}
          <Box className="px-6 mb-6">
            {contactMethods.map((method, index) => (
              <ContactCard key={index} {...method} />
            ))}
          </Box>

          {/* Contact Form */}
          <Box className="mx-6 mb-6 bg-background-50 rounded-2xl p-6 shadow-soft-2">
            <VStack space="lg">
              <VStack space="sm" className="items-center">
                <Box className="w-14 h-14 bg-primary-500 rounded-full items-center justify-center mb-2">
                  <MessageCircle size={28} color="#FFFFFF" />
                </Box>
                <Heading size="xl" className="text-typography-900 text-center">{t('help.formTitle')}</Heading>
                <Text size="sm" className="text-typography-600 text-center">{t('help.formSubtitle')}</Text>
              </VStack>

              {submitted && (
                <Box className="bg-success-100 rounded-lg p-4 border border-success-300">
                  <HStack space="sm" className="items-center">
                    <AlertCircle size={20} color="#16a34a" />
                    <VStack className="flex-1">
                      <Text className="text-success-700 font-semibold">{t('help.successTitle')}</Text>
                      <Text size="sm" className="text-success-600">{t('help.successMessage')}</Text>
                    </VStack>
                  </HStack>
                </Box>
              )}

              <VStack space="md">
                {/* Nom */}
                <VStack space="xs">
                  <Text className="text-typography-900 font-medium">{t('help.nameLabel')}</Text>
                  <Input variant="outline" size="lg">
                    <InputField
                      placeholder={t('help.namePlaceholder')}
                      value={formData.name}
                      onChangeText={(text) => setFormData({ ...formData, name: text })}
                      returnKeyType="next"
                    />
                  </Input>
                </VStack>

                {/* Email */}
                <VStack space="xs">
                  <Text className="text-typography-900 font-medium">{t('help.emailLabel')}</Text>
                  <Input variant="outline" size="lg">
                    <InputField
                      placeholder={t('help.emailPlaceholder')}
                      value={formData.email}
                      onChangeText={(text) => setFormData({ ...formData, email: text })}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      returnKeyType="next"
                    />
                  </Input>
                </VStack>

                {/* Sujet */}
                <VStack space="xs">
                  <Text className="text-typography-900 font-medium">{t('help.subjectLabel')}</Text>
                  <Input variant="outline" size="lg">
                    <InputField
                      placeholder={t('help.subjectPlaceholder')}
                      value={formData.subject}
                      onChangeText={(text) => setFormData({ ...formData, subject: text })}
                      returnKeyType="next"
                    />
                  </Input>
                </VStack>

                {/* Message */}
                <VStack space="xs">
                  <Text className="text-typography-900 font-medium">{t('help.messageLabel')}</Text>
                  <TextInput
                    multiline
                    placeholder={t('help.messagePlaceholder')}
                    value={formData.message}
                    onChangeText={(text) => setFormData({ ...formData, message: text })}
                    onContentSizeChange={(e) => {
                      const h = Math.max(120, Math.min(e.nativeEvent.contentSize.height, 300));
                      setMessageHeight(h);
                    }}
                    style={{
                      height: messageHeight,
                      textAlignVertical: 'top',
                      paddingTop: 12,
                      borderWidth: 1,
                      borderColor: '#e5e7eb',
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 16,
                      backgroundColor: 'white',
                    }}
                    returnKeyType="done"
                    blurOnSubmit
                  />
                </VStack>

                {/* Bouton envoyer */}
                <Button size="lg" action="primary" onPress={handleSubmit} className="mt-2">
                  <ButtonIcon as={Send} />
                  <ButtonText>{t('help.sendButton')}</ButtonText>
                </Button>
              </VStack>
            </VStack>
          </Box>

          {/* Quick Info Cards */}
          <Box className="px-6 mb-6">
            <HStack space="md">
              <InfoCard icon={Clock} title={t('help.responseTitle')} subtitle={t('help.responseTime')} />
              <InfoCard icon={Globe} title={t('help.languagesTitle')} subtitle={t('help.languagesSupported')} />
            </HStack>
          </Box>

          <Box className="px-6 mb-6">
            <InfoCard icon={Phone} title={t('help.phoneTitle')} subtitle={t('help.phoneNumber')} />
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
