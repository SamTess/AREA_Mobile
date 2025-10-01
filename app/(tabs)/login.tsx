import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
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
  const { login, isLoading, error, clearError } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');
    clearError();

    let hasError = false;

    if (!email) {
      setEmailError(t('login.emailRequired'));
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError(t('login.emailInvalid'));
      hasError = true;
    }

    if (!password) {
      setPasswordError(t('login.passwordRequired'));
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError(t('login.passwordTooShort'));
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      await login(email, password);
      Alert.alert(
        t('login.successTitle') || 'Connexion réussie',
        t('login.successMessage') || 'Vous êtes maintenant connecté',
        [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)'),
          },
        ]
      );
    } catch (err) {
      Alert.alert(
        t('login.errorTitle') || 'Erreur',
        error || t('login.errorMessage') || 'La connexion a échoué'
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

          {/* Formulaire */}
          <VStack space="xl">
            {/* Champ Email */}
            <VStack space="xs">
              <Text size="sm" bold className="text-typography-900 mb-1">
                {t('login.emailLabel')}
              </Text>
              <Input 
                variant="outline" 
                size="lg"
                isInvalid={!!emailError}
                className="border-outline-300 bg-background-0 focus:border-primary-500 rounded-lg"
              >
                <InputField
                  placeholder={t('login.emailPlaceholder')}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </Input>
              {emailError ? (
                <Box className="flex-row items-center mt-1">
                  <Text size="xs" className="text-error-600 ml-1">
                    ⚠️ {emailError}
                  </Text>
                </Box>
              ) : (
                <Text size="xs" className="text-typography-500 ml-1 mt-1">
                  {t('login.emailHelper')}
                </Text>
              )}
            </VStack>

            {/* Champ Mot de passe */}
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
            <Button
              variant="link"
              action="primary"
              size="sm"
              className="self-center mt-2"
            >
              <ButtonText className="text-primary-500 hover:text-primary-600">
                {t('login.forgotPassword')}
              </ButtonText>
            </Button>
          </VStack>
        </Box>

        {/* Section inscription */}
        <Box className="items-center mt-4">
          <Text size="sm" className="text-typography-600">
            {t('login.noAccount')}{' '}
            <Text size="sm" bold className="text-primary-500">
              {t('login.signUp')}
            </Text>
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
