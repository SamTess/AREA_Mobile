import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { GithubIcon, GoogleIcon, MicrosoftIcon } from '@/components/ui/oauth-buttons';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { EyeIcon, EyeOffIcon, LockKeyhole } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert } from 'react-native';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login, isLoading, clearError } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleOAuthLogin = (provider: 'github' | 'google' | 'microsoft') => {
    Alert.alert(
      t('login.successTitle'),
      `OAuth login with ${provider} (to be implemented)`,
      [{ text: 'OK' }]
    );
  };

  const handleLogin = async () => {
    setIdentifierError('');
    setPasswordError('');
    clearError();

    let hasError = false;

    if (!identifier) {
      setIdentifierError(t('login.emailRequired') || 'Email or username is required');
      hasError = true;
    }

    if (!password) {
      setPasswordError(t('login.passwordRequired'));
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError(t('login.passwordTooShort'));
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      await login(identifier, password);
      Alert.alert(
        t('login.successTitle') || 'Connexion réussie',
        t('login.successMessage') || 'Vous êtes maintenant connecté',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : (t('login.errorMessage') || 'La connexion a échoué');
      Alert.alert(
        t('login.errorTitle') || 'Erreur',
        msg
      );
    }
  };

  return (
    <Box className="flex-1 bg-background-50 justify-center">
      <VStack space="2xl" className="w-full max-w-md mx-auto px-6">
        {/* Carte de login avec fond */}
        <Box className="bg-background-0 rounded-2xl shadow-lg p-8">
          {/* Icône en haut */}
          <Center className="mb-6">
            <Box className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center">
              <LockKeyhole size={40} color="#333333" strokeWidth={2} />
            </Box>
          </Center>

          {/* En-tête */}
          <VStack space="md" className="items-center mb-8">
            <Heading size="4xl" className="text-center text-primary-500">
              {t('login.title')}
            </Heading>
            <Text size="md" className="text-typography-600 text-center">
              {t('login.subtitle')}
            </Text>
          </VStack>

          <VStack space="xl">
            <VStack space="xs">
              <Text size="sm" bold className="text-typography-900 mb-1">
                {t('login.emailLabel') || 'Email or Username'}
              </Text>
              <Input
                variant="outline"
                size="lg"
                isInvalid={!!identifierError}
                className="border-outline-300 bg-background-0 focus:border-primary-500 rounded-lg"
              >
                <InputField
                  placeholder={t('login.emailPlaceholder') || 'Enter email or username'}
                  value={identifier}
                  onChangeText={(text) => {
                    setIdentifier(text);
                    setIdentifierError('');
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </Input>
              {identifierError ? (
                <Box className="flex-row items-center mt-1">
                  <Text size="xs" className="text-error-600 ml-1">
                    ⚠️ {identifierError}
                  </Text>
                </Box>
              ) : (
                <Text size="xs" className="text-typography-500 ml-1 mt-1">
                  {t('login.emailHelper') || 'Your email or username'}
                </Text>
              )}
            </VStack>

            <VStack space="xs">
              <Text size="sm" bold className="text-typography-900 mb-1">
                {t('login.passwordLabel')}
              </Text>
              <Input
                variant="outline"
                size="lg"
                isInvalid={!!passwordError}
                className="border-outline-300 bg-background-0 focus:border-primary-500 rounded-lg"
              >
                <InputField
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('login.passwordPlaceholder')}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError('');
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <InputSlot className="pr-3" onPress={handleShowPassword}>
                  <InputIcon 
                    as={showPassword ? EyeIcon : EyeOffIcon} 
                    className="text-typography-500"
                  />
                </InputSlot>
              </Input>
              {passwordError ? (
                <Box className="flex-row items-center mt-1">
                  <Text size="xs" className="text-error-600 ml-1">
                    ⚠️ {passwordError}
                  </Text>
                </Box>
              ) : (
                <Text size="xs" className="text-typography-500 ml-1 mt-1">
                  {t('login.passwordHelper')}
                </Text>
              )}
            </VStack>

            {/* Bouton de connexion */}
            <Button
              size="lg"
              onPress={handleLogin}
              isDisabled={isLoading}
              className="mt-6 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 rounded-lg shadow-md"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <ButtonText className="font-semibold text-base">
                  {t('login.loginButton')}
                </ButtonText>
              )}
            </Button>

            {/* Lien mot de passe oublié */}
            <Box className="items-center mt-2">
              <Text 
                size="sm" 
                className="text-primary-500"
                onPress={() => router.push('/(tabs)/forgot-password')}
              >
                {t('login.forgotPassword')}
              </Text>
            </Box>

            {/* Divider avec texte */}
            <HStack space="md" className="items-center my-4">
              <Box className="flex-1 h-[1px] bg-outline-200" />
              <Text size="sm" className="text-typography-500">
                {t('login.orContinueWith')}
              </Text>
              <Box className="flex-1 h-[1px] bg-outline-200" />
            </HStack>

            {/* Boutons OAuth - Version compacte horizontale */}
            <HStack space="md" className="justify-center">
              {/* GitHub */}
              <Button
                size="lg"
                variant="outline"
                action="default"
                onPress={() => handleOAuthLogin('github')}
                className="border-outline-300 bg-background-0 hover:bg-background-50 rounded-lg flex-1"
              >
                <GithubIcon size={24} />
              </Button>

              {/* Google */}
              <Button
                size="lg"
                variant="outline"
                action="default"
                onPress={() => handleOAuthLogin('google')}
                className="border-outline-300 bg-background-0 hover:bg-background-50 rounded-lg flex-1"
              >
                <GoogleIcon size={24} />
              </Button>

              {/* Microsoft */}
              <Button
                size="lg"
                variant="outline"
                action="default"
                onPress={() => handleOAuthLogin('microsoft')}
                className="border-outline-300 bg-background-0 hover:bg-background-50 rounded-lg flex-1"
              >
                <MicrosoftIcon size={24} />
              </Button>
            </HStack>
          </VStack>
        </Box>

        {/* Section inscription */}
        <Box className="items-center mt-4">
          <Text size="sm" className="text-typography-600">
            {t('login.noAccount')}{' '}
            <Text 
              size="sm" 
              bold 
              className="text-primary-500"
              onPress={() => router.push('/(tabs)/register')}
            >
              {t('login.signUp')}
            </Text>
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
